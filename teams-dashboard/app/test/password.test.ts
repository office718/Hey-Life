import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/password.ts";
import { DEMO_PASSWORD } from "../scripts/seed-data.ts";

test("password hash matches the password and rejects another", async () => {
  const stored = await hashPassword(DEMO_PASSWORD);
  assert.equal(await verifyPassword(DEMO_PASSWORD, stored), true);
  assert.equal(await verifyPassword("wrong-password", stored), false);
  assert.equal(await verifyPassword(DEMO_PASSWORD, null), false);
  assert.notEqual(await hashPassword(DEMO_PASSWORD), stored);
});