// Imports data/<collection>/<id>.json into the database.
//   npm run import            -> adds documents that don't exist yet
//   npm run import -- --replace  -> overwrites existing documents with the same id
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pool, q } from "../src/db.ts";
import { migrate } from "../src/migrate.ts";
import { COLLECTIONS } from "../src/access.ts";

const dir = process.argv.find(a => !a.startsWith("-") && a !== process.argv[0] && a !== process.argv[1]) || "data";
const replace = process.argv.includes("--replace");
await migrate();
let n = 0, skipped = 0;
for (const col of COLLECTIONS) {
  const d = join(dir, col); if (!existsSync(d)) continue;
  for (const f of readdirSync(d).filter(f => f.endsWith(".json"))) {
    const id = f.slice(0, -5), data = JSON.parse(readFileSync(join(d, f), "utf8")); delete data.id;
    const r = await q(`insert into documents (collection, id, data) values ($1, $2, $3)
      on conflict (collection, id) do ${replace ? "update set data = excluded.data, version = documents.version + 1, updated_at = now()" : "nothing"} returning id`, [col, id, data]);
    r.length ? n++ : skipped++;
  }
}
console.log(`imported ${n} documents${skipped ? `, ${skipped} already there (use --replace to overwrite)` : ""}`);
await pool.end();
