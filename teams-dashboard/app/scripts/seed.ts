// Demo logins for local development. Refuses the public server.
//   pnpm seed
import { pool, q } from "../src/db.ts";
import { migrate } from "../src/migrate.ts";
import { hashPassword } from "../src/password.ts";
import { DEMO_PASSWORD, DEMO_USERS, demoDocuments } from "./seed-data.ts";

const appUrl = (process.env.APP_URL || "").replace(/\/$/, "");
const allowEmptyDemo = process.env.ALLOW_DEMO_SEED === "1";
if (!allowEmptyDemo && (process.env.NODE_ENV === "production" || appUrl === "https://team.heylifeapp.de")) {
  console.error("seed refuses to run in production");
  process.exit(1);
}

await migrate();
if (allowEmptyDemo) {
  const foreignDoc = await q("select 1 from documents where id not like 'demo-%' limit 1");
  const foreignUser = await q("select 1 from users where email not like '%@demo.heychurch.test' limit 1");
  if (foreignDoc.length || foreignUser.length) {
    console.error("seed refuses to run: this database is not a demo database");
    process.exit(1);
  }
}
const docs = demoDocuments();
for (const doc of docs) {
  await q(
    `insert into documents (collection, id, data) values ($1, $2, $3)
     on conflict (collection, id) do update set data = excluded.data, version = documents.version + 1, updated_at = now()`,
    [doc.collection, doc.id, doc.data],
  );
}
for (const u of DEMO_USERS) {
  const passwordHash = await hashPassword(u.password);
  await q(
    `insert into users (login, email, password_hash, person_id, role, lang) values ($1, $2, $3, $4, $5, $6)
     on conflict (email) do update set login = excluded.login, password_hash = excluded.password_hash,
       person_id = excluded.person_id, role = excluded.role, lang = excluded.lang, disabled = false`,
    [u.login, u.email, passwordHash, u.personId, u.role, u.lang],
  );
}
console.log(`seeded ${docs.length} documents and ${DEMO_USERS.length} users`);
for (const u of DEMO_USERS) console.log(`  ${u.login.padEnd(8)} ${u.role.padEnd(8)} ${u.personId}`);
console.log(`Sign in at /login. Password for every demo id: ${DEMO_PASSWORD}`);
await pool.end();
