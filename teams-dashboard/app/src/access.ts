// Who may see and change what. Keep these rules in one place and test them (test/access.test.ts).
// Roles: admin and staff see and change everything. "leader" (department and volunteer leaders)
// sees the team's work, but private things only about themselves and the people who report to them.
import type { User } from "./auth.ts";
import { q } from "./db.ts";

export type Doc = Record<string, any> & { id: string };
export type Ctx = { user: User; me: string; full: boolean; people: Map<string, Doc>; above: (pid: string) => boolean };

export const COLLECTIONS = ["people", "tasks", "meetings", "groups", "weeks", "metrics", "rhythms", "pulses", "seen", "stops", "notes", "content", "projects", "spend", "requests"] as const;

// Fields of a person that only the person and the people above them may read.
const PRIVATE_PERSON_FIELDS = ["idWho", "idFor", "idGift", "idBecome", "goal", "why", "strategy", "goalBy", "goalStatus", "support", "sabbath", "family", "focus", "focusHow", "cfocus", "prio", "alloc", "budgets"];
// Fields a leader may not change on their own person record.
const PROTECTED_PERSON_FIELDS = ["reports", "role", "roleDe", "order", "unit", "vacant", "studio", "broadcast", "budget"];

export async function context(user: User): Promise<Ctx> {
  const rows = await q<{ id: string; data: any }>("select id, data from documents where collection = 'people'");
  const people = new Map(rows.map(r => [r.id, { ...r.data, id: r.id }]));
  const me = user.person_id || "";
  // true when `me` is somewhere above `pid` in the reports chain
  const above = (pid: string) => {
    let p = people.get(pid), n = 0;
    while (p && p.reports && n++ < 15) { if (p.reports === me) return true; p = people.get(p.reports); }
    return false;
  };
  return { user, me, full: user.role === "admin" || user.role === "staff", people, above };
}

const selfOrAbove = (ctx: Ctx, pid: string) => !!pid && (pid === ctx.me || ctx.above(pid));
const projectOf = (id: string) => q<{ data: any }>("select data from documents where collection = 'projects' and id = $1", [id]).then(r => r[0]?.data);
const inProject = (ctx: Ctx, p: any) => !!p && (p.leader === ctx.me || p.sponsor === ctx.me || (p.team || []).some((m: any) => m.pid === ctx.me));

/** Filters a collection before it is sent to the browser. */
export async function filterRead(ctx: Ctx, col: string, docs: Doc[]): Promise<Doc[]> {
  if (ctx.full) return docs;
  switch (col) {
    case "people":
      return docs.map(d => selfOrAbove(ctx, d.id) ? d : Object.fromEntries(Object.entries(d).filter(([k]) => !PRIVATE_PERSON_FIELDS.includes(k))) as Doc);
    case "pulses": return docs.filter(d => selfOrAbove(ctx, d.pid));
    case "seen": return []; // "I see in you" is for the Lead Team only
    case "stops": return docs;
    case "groups": // Hey Fam leaders: check-ins (energy, prayer requests) only for the person who does them
      return docs.map(d => d.owner === ctx.me ? d : (({ checks, ...rest }) => rest as Doc)(d));
    case "meetings":
      return docs.filter(d => d.personId ? selfOrAbove(ctx, d.personId) : d.rhythmId !== "leadteam");
    case "tasks":
      return docs.filter(d => d.area !== "Growth" || selfOrAbove(ctx, d.owner));
    case "notes": return docs.filter(d => d.to === ctx.me);
    case "spend": {
      const out: Doc[] = [];
      for (const d of docs) {
        const [kind, id] = String(d.owner || "").split(":");
        if (kind === "dept" && id === ctx.me) out.push(d);
        else if (kind === "prj" && inProject(ctx, await projectOf(id))) out.push(d);
      }
      return out;
    }
    default: return docs;
  }
}

/** Returns null when allowed, or a short reason when not. */
export async function checkWrite(ctx: Ctx, op: "create" | "set" | "update" | "delete", col: string, id: string, before: Doc | null, after: Doc | null): Promise<string | null> {
  if (ctx.full) return null;
  const me = ctx.me, b = before || ({} as Doc), a = after || ({} as Doc);
  if (!me) return "no person linked to this login";
  switch (col) {
    case "tasks":
      if (op === "create") return null;
      return [b.owner, a.owner].some(o => !o || o === me || ctx.above(o)) ? null : "not your task";
    case "notes":
      if (op === "create") return null;
      return b.to === me ? null : "not your notification";
    case "requests":
      if (op === "create") return a.from === me ? null : "requests are sent in your own name";
      return [b.from, b.to].includes(me) || ctx.above(b.to) ? null : "not your request";
    case "pulses":
      return (a.pid || b.pid) === me || id.startsWith(me + "_") ? null : "only your own rhythm check";
    case "meetings":
      if (op === "create" || op === "set") return a.rhythmId === "leadteam" ? "Lead Team only" : null;
      return a.personId && selfOrAbove(ctx, a.personId) ? null : "only staff can change this meeting";
    case "people":
      if (op === "delete" || op === "create") return "only staff";
      if (id === me) {
        if (PROTECTED_PERSON_FIELDS.some(f => JSON.stringify(b[f]) !== JSON.stringify(a[f]))) return "these fields are set by staff";
        // a leader may request their own budget (wish) but never approve it
        const appr = (d: Doc) => JSON.stringify(Object.entries(d.budgets || {}).filter(([, v]: [string, any]) => v?.approved != null && v?.approved !== "").map(([y, v]: [string, any]) => [y, v.approved]).sort());
        return appr(a) !== appr(b) ? "the approved budget is set by the person you report to" : null;
      }
      return ctx.above(id) ? null : "not your team";
    case "content": {
      const p = ctx.people.get(me);
      return p?.studio || b.approver === me || a.approver === me ? null : "not your content";
    }
    case "spend": {
      const [kind, pid] = String((a.owner || b.owner) || "").split(":");
      if (kind === "dept") return pid === me ? null : "not your budget";
      return inProject(ctx, await projectOf(pid)) ? null : "not your project";
    }
    case "groups":
      return op === "update" && b.owner === me && a.owner === me ? null : "only staff or the person who does the check-in";
    case "projects":
      if (op === "update") return b.leader === me || b.sponsor === me ? null : "only the project leader";
      return "only staff";
    default:
      return "only staff"; // weeks, metrics, rhythms, seen, stops
  }
}
