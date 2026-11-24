// The data API the dashboard uses: one endpoint per collection, filtered by src/access.ts.
import { Hono } from "hono";
import { randomBytes } from "node:crypto";
import type { Env } from "./auth.ts";
import { q, one } from "./db.ts";
import { COLLECTIONS, context, filterRead, checkWrite, type Doc } from "./access.ts";
import { changed } from "./realtime.ts";
import { onNoteCreated } from "./notify.ts";

export const data = new Hono<Env>();
const known = new Set<string>(COLLECTIONS);
const newId = () => { const a = "abcdefghijklmnopqrstuvwxyz0123456789", b = randomBytes(20); let s = ""; for (const x of b) s += a[x % 36]; return s; };
const clean = (d: any) => { const o = { ...(d || {}) }; delete o.id; return o; };
const tooBig = (d: unknown) => JSON.stringify(d).length > 200_000;

data.use("/api/data/:col/*", async (c, next) => known.has(c.req.param("col")) ? next() : c.json({ code: "not_found" }, 404));
data.use("/api/data/:col", async (c, next) => known.has(c.req.param("col")) ? next() : c.json({ code: "not_found" }, 404));

data.get("/api/data/:col", async c => {
  const col = c.req.param("col"), ctx = await context(c.get("user"));
  const rows = await q<{ id: string; data: any }>("select id, data from documents where collection = $1 order by created_at", [col]);
  return c.json(await filterRead(ctx, col, rows.map(r => ({ ...r.data, id: r.id }))));
});

async function write(c: any, op: "create" | "set" | "update" | "delete", col: string, id: string, body: any) {
  if (!/^[\w\-.:@+]{1,200}$/.test(id)) return c.json({ code: "invalid_argument" }, 400);
  const user = c.get("user"), ctx = await context(user);
  const row = await one<{ data: any }>("select data from documents where collection = $1 and id = $2", [col, id]);
  const before: Doc | null = row ? { ...row.data, id } : null;
  if ((op === "update" || op === "delete") && !before) return c.json({ code: "not_found" }, 404);
  if (op === "create" && before) return c.json({ code: "already_exists" }, 409);
  const incoming = clean(body?.data);
  if (op !== "delete" && tooBig(incoming)) return c.json({ code: "too_large" }, 413);
  // update = top-level merge, like the Claude version: a field you send replaces that field completely.
  const after: Doc | null = op === "delete" ? null : op === "update" ? { ...(before as Doc), ...incoming, id } : { ...incoming, id };
  const why = await checkWrite(ctx, op, col, id, before, after);
  if (why) return c.json({ code: "forbidden", message: why }, 403);
  if (op === "delete") await q("delete from documents where collection = $1 and id = $2", [col, id]);
  else await q(
    `insert into documents (collection, id, data, updated_by) values ($1, $2, $3, $4)
     on conflict (collection, id) do update set data = excluded.data, version = documents.version + 1, updated_at = now(), updated_by = excluded.updated_by`,
    [col, id, clean(after), user.id]);
  changed(col);
  if (col === "notes" && op === "create") onNoteCreated(clean(after)).catch(e => console.error("notify", e));
  return c.json({ ok: true, id });
}

const body = (c: any) => c.req.json().catch(() => ({}));
data.post("/api/data/:col", async c => { const b = await body(c); return write(c, "create", c.req.param("col"), String(b.id || "") || newId(), b); });
data.put("/api/data/:col/:id", async c => write(c, "set", c.req.param("col"), c.req.param("id"), await body(c)));
data.patch("/api/data/:col/:id", async c => write(c, "update", c.req.param("col"), c.req.param("id"), await body(c)));
data.delete("/api/data/:col/:id", async c => write(c, "delete", c.req.param("col"), c.req.param("id"), null));
