import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { COLLECTIONS } from "../src/access.ts";
import { DEMO_PASSWORD, DEMO_USERS, demoDocuments } from "../scripts/seed-data.ts";

const root = dirname(fileURLToPath(import.meta.url));
const app = join(root, "..");

test("demo users cover every role and point at demo people", () => {
  const docs = demoDocuments("2026-11-03", Date.UTC(2026, 10, 3, 8));
  const people = new Map(docs.filter(d => d.collection === "people").map(d => [d.id, d.data]));
  assert.deepEqual(DEMO_USERS.map(u => u.role).sort(), ["admin", "leader", "staff"]);
  assert.deepEqual(DEMO_USERS.map(u => u.login).sort(), ["ada", "lea", "sam"]);
  for (const u of DEMO_USERS) {
    assert.equal(u.password, DEMO_PASSWORD);
    assert.match(u.email, /@demo\.heychurch\.test$/);
    assert.equal(people.has(u.personId), true);
    assert.match(u.personId, /^demo-/);
  }
  assert.equal(people.get("demo-ada")!.reports, undefined);
  assert.equal(people.get("demo-sam")!.reports, "demo-ada");
  assert.equal(people.get("demo-lea")!.reports, "demo-sam");
  assert.equal(people.get("demo-kim")!.reports, "demo-lea");
  for (const d of docs) {
    assert.ok((COLLECTIONS as readonly string[]).includes(d.collection), d.collection);
    assert.match(d.id, /^demo-/);
  }
  const growth = docs.find(d => d.id === "demo-task-kim-growth")!;
  assert.equal(growth.data.owner, "demo-kim");
  assert.equal(growth.data.area, "Growth");
  assert.equal(growth.data.due, "2026-11-03");
  assert.equal(docs.find(d => d.id === "demo-meet-lead")!.data.rhythmId, "leadteam");
  assert.equal(docs.find(d => d.id === "demo-note-lea")!.data.to, "demo-lea");
});

test("seed refuses production and the public origin", () => {
  const run = (env: NodeJS.ProcessEnv) => spawnSync(process.execPath, ["--import", "tsx", "scripts/seed.ts"], {
    cwd: app,
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
  const prod = run({ NODE_ENV: "production", APP_URL: "http://localhost:3000" });
  assert.equal(prod.status, 1);
  assert.match(prod.stderr, /refuses to run in production/);
  const publicOrigin = run({ NODE_ENV: "development", APP_URL: "https://team.heylifeapp.de" });
  assert.equal(publicOrigin.status, 1);
  assert.match(publicOrigin.stderr, /refuses to run in production/);
  const allowed = run({
    NODE_ENV: "production",
    APP_URL: "https://team.heylifeapp.de",
    ALLOW_DEMO_SEED: "1",
    DATABASE_URL: "postgres://hey:hey@127.0.0.1:1/hey",
  });
  assert.equal(allowed.status, 1);
  assert.doesNotMatch(allowed.stderr, /refuses to run in production/);
});
