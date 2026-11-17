// Gives someone access.
//   npm run add-user -- <login> <password> <email> <personId> <admin|staff|leader> [de|en]
// personId is the id in the "people" collection (e.g. victor, michi, goddy). Run without arguments to list people.
import { pool, q } from "../src/db.ts";
import { migrate } from "../src/migrate.ts";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../src/password.ts";

await migrate();
const [login, password, email, personId, role = "leader", lang = "de"] = process.argv.slice(2);
if (!login) {
  const people = await q("select id, data->>'name' as name, data->>'role' as role from documents where collection = 'people' order by (data->>'order')::int nulls last");
  console.log("Usage: npm run add-user -- <login> <password> <email> <personId> <admin|staff|leader> [de|en]\n\nPeople:");
  for (const p of people) console.log(`  ${p.id.padEnd(18)} ${p.name}  (${p.role || ""})`);
  const users = await q("select login, email, person_id, role, lang, disabled, password_hash is not null as has_password from users order by login");
  console.log("\nUsers:");
  for (const u of users) console.log(`  ${String(u.login).padEnd(18)} ${String(u.email).padEnd(32)} ${String(u.person_id).padEnd(16)} ${u.role} ${u.lang}${u.has_password ? "" : " (no password)"}${u.disabled ? " (disabled)" : ""}`);
} else {
  const id = login.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._@+-]{0,63}$/.test(id)) throw new Error("login id must be 1–64 characters: letters, numbers, . _ @ + -");
  if (!password || password.length < MIN_PASSWORD_LENGTH) throw new Error(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || "")) throw new Error("email is required");
  if (!["admin", "staff", "leader"].includes(role)) throw new Error("role must be admin, staff or leader");
  const exists = (await q("select 1 from documents where collection = 'people' and id = $1", [personId])).length;
  if (!exists) console.warn(`warning: no person "${personId}" in people`);
  const passwordHash = await hashPassword(password);
  await q(`insert into users (login, email, password_hash, person_id, role, lang) values ($1, lower($2), $3, $4, $5, $6)
    on conflict (email) do update set login = excluded.login, password_hash = excluded.password_hash,
      person_id = excluded.person_id, role = excluded.role, lang = excluded.lang, disabled = false`,
    [id, email.trim(), passwordHash, personId, role, lang === "en" ? "en" : "de"]);
  console.log(`ok: ${id} -> ${personId} (${role}, ${lang})`);
}
await pool.end();
