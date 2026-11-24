// Access rules without a database: run with  npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { filterRead, checkWrite, type Ctx, type Doc } from "../src/access.ts";

const people = new Map<string, Doc>([
  ["victor", { id: "victor", name: "Victor", idWho: "secret", prio: ["a"] }],
  ["michi", { id: "michi", name: "Michi", reports: "victor" }],
  ["goddy", { id: "goddy", name: "Goddy", reports: "michi", idWho: "mine" }],
  ["andinia", { id: "andinia", name: "Andinia", reports: "michi" }],
  ["helper", { id: "helper", name: "Helper", reports: "goddy" }],
]);
function ctx(me: string, role: "admin" | "staff" | "leader" = "leader"): Ctx {
  const above = (pid: string) => { let p = people.get(pid), n = 0; while (p && p.reports && n++ < 15) { if (p.reports === me) return true; p = people.get(p.reports); } return false; };
  return { user: { id: 1, login: "x", email: "x@y.z", person_id: me, role, lang: "de" }, me, full: role !== "leader", people, above };
}

test("leaders don't see others' private fields, but their own and their team's", async () => {
  const out = await filterRead(ctx("goddy"), "people", [...people.values()]);
  assert.equal(out.find(p => p.id === "victor")!.idWho, undefined);
  assert.equal(out.find(p => p.id === "goddy")!.idWho, "mine");
  assert.ok(out.find(p => p.id === "victor")!.name);
});
test("lead team meetings and 'I see in you' stay with the lead team", async () => {
  const m = await filterRead(ctx("goddy"), "meetings", [{ id: "a", rhythmId: "leadteam" }, { id: "b", rhythmId: "heylife" }, { id: "c", personId: "andinia" }, { id: "d", personId: "helper" }]);
  assert.deepEqual(m.map(x => x.id), ["b", "d"]);
  assert.deepEqual(await filterRead(ctx("goddy"), "seen", [{ id: "s" }]), []);
  assert.equal((await filterRead(ctx("michi", "staff"), "seen", [{ id: "s" }])).length, 1);
});
test("growth tasks are private to the person and the people above", async () => {
  const t = await filterRead(ctx("goddy"), "tasks", [{ id: "1", area: "Growth", owner: "andinia" }, { id: "2", area: "Growth", owner: "helper" }, { id: "3", area: "General", owner: "andinia" }]);
  assert.deepEqual(t.map(x => x.id), ["2", "3"]);
});
test("write rules for leaders", async () => {
  const g = ctx("goddy");
  assert.equal(await checkWrite(g, "update", "tasks", "1", { id: "1", owner: "goddy" }, { id: "1", owner: "goddy", done: true }), null);
  assert.ok(await checkWrite(g, "update", "tasks", "1", { id: "1", owner: "andinia" }, { id: "1", owner: "andinia", done: true }));
  assert.equal(await checkWrite(g, "update", "tasks", "1", { id: "1", owner: "helper" }, { id: "1", owner: "helper", done: true }), null);
  assert.ok(await checkWrite(g, "update", "people", "goddy", people.get("goddy")!, { ...people.get("goddy")!, reports: "victor" }));
  assert.equal(await checkWrite(g, "update", "people", "goddy", people.get("goddy")!, { ...people.get("goddy")!, prio: ["x"] }), null);
  assert.equal(await checkWrite(g, "update", "people", "goddy", people.get("goddy")!, { ...people.get("goddy")!, name: "Goddy K" }), null);
  assert.ok(await checkWrite(g, "update", "weeks", "2026-11-01", { id: "w" }, { id: "w", title: "x" }));
  assert.ok(await checkWrite(g, "create", "requests", "r", null, { id: "r", from: "andinia", to: "goddy" }));
  assert.ok(await checkWrite(g, "create", "meetings", "m", null, { id: "m", rhythmId: "leadteam" }));
  assert.equal(await checkWrite(ctx("michi", "staff"), "update", "weeks", "w", { id: "w" }, { id: "w", title: "x" }), null);
});
