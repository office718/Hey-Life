// Hey Church team app: serves the dashboard as an installable web app with its own login and database.
import "./instrument.ts";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { getCookie } from "hono/cookie";
import { secureHeaders } from "hono/secure-headers";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cfg } from "./config.ts";
import { q, one } from "./db.ts";
import { migrate } from "./migrate.ts";
import { auth, endOtherSessions, limited, requireUser, requireClientHeader, type Env, type User } from "./auth.ts";
import { fillerHash, hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "./password.ts";
import { data } from "./data.ts";
import { realtime } from "./realtime.ts";
import { push } from "./notify.ts";
import { ai } from "./ai.ts";
import { startJobs } from "./jobs.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

// ---- Fonts are served from our own server (no Google Fonts: GDPR) ----
function fontCss() {
  const parts: string[] = [];
  for (const [pkg, family] of [["@fontsource-variable/bricolage-grotesque", "Bricolage Grotesque"], ["@fontsource-variable/figtree", "Figtree"]]) {
    const dir = dirname(require.resolve(`${pkg}/package.json`));
    const css = readFileSync(join(dir, "wght.css"), "utf8")
      .replace(/font-family:\s*'[^']+'/g, `font-family: '${family}'`)
      .replace(/url\(\.\/files\//g, `url(/fonts/${pkg.split("/")[1]}/`);
    parts.push(css);
  }
  return parts.join("\n");
}
const FONT_CSS = fontCss();

// ---- The dashboard page, with the bridge injected ----
function loadDashboard() {
  const html = readFileSync(join(root, "dashboard", "hey-church-dashboard.html"), "utf8");
  return html
    .replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/g, "")
    .replace(/<link[^>]+fonts\.googleapis\.com\/css2[^>]*>/g, '<link rel="stylesheet" href="/fonts.css">')
    .replace(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jszip\/[\d.]+\/jszip\.min\.js/g, "/vendor/jszip.min.js");
}
let DASHBOARD = loadDashboard();
const safeJson = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");
function dashboardFor(u: User) {
  const head = `<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#0F353A">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<script>window.__HEY=${safeJson({ me: u.person_id || "", lang: u.lang, role: u.role })};
try{localStorage.setItem("hey.me",window.__HEY.me);if(localStorage.getItem("hey.lang")===null)localStorage.setItem("hey.lang",window.__HEY.lang==="en"?"1":"0");}catch(e){}
window.__HEY_LOCK_ME=window.__HEY.role!=="admin";</script>
<script src="/claude-bridge.js"></script>
`;
  return DASHBOARD.replace("</head>", head + "</head>");
}

const app = new Hono<Env>();
app.use("*", secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "blob:"],
    fontSrc: ["'self'"],
    connectSrc: ["'self'"],
    workerSrc: ["'self'"],
    frameAncestors: ["'none'"],
  },
  crossOriginEmbedderPolicy: false,
}));
app.use("/api/*", bodyLimit({ maxSize: 2 * 1024 * 1024, onError: c => c.json({ code: "too_large" }, 413) }));

app.get("/health", async c => { await q("select 1"); return c.json({ ok: true }); });
app.get("/fonts.css", c => c.body(FONT_CSS, 200, { "content-type": "text/css", "cache-control": "public, max-age=86400" }));
for (const pkg of ["bricolage-grotesque", "figtree"]) {
  const dir = join(dirname(require.resolve(`@fontsource-variable/${pkg}/package.json`)), "files");
  app.get(`/fonts/${pkg}/:file`, c => {
    const f = c.req.param("file");
    if (!/^[\w.-]+\.woff2?$/.test(f) || !existsSync(join(dir, f))) return c.notFound();
    return c.body(readFileSync(join(dir, f)), 200, { "content-type": "font/woff2", "cache-control": "public, max-age=31536000, immutable" });
  });
}
const JSZIP = readFileSync(join(dirname(require.resolve("jszip/package.json")), "dist", "jszip.min.js"));
app.get("/vendor/jszip.min.js", c => c.body(JSZIP, 200, { "content-type": "text/javascript", "cache-control": "public, max-age=604800" }));
app.get("/login", c => c.html(readFileSync(join(root, "public", "login.html"), "utf8")));
app.use("/*", serveStatic({ root: "./public", rewriteRequestPath: p => p }));

app.route("/", auth);
app.use("/api/*", requireUser, requireClientHeader);
app.route("/", data);
app.route("/", realtime);
app.route("/", push);
app.route("/", ai);

app.get("/api/me", c => { const u = c.get("user"); return c.json({ email: u.email, personId: u.person_id, role: u.role, lang: u.lang, canWrite: true }); });
app.patch("/api/me", async c => {
  const b = await c.req.json().catch(() => ({}));
  if (b.lang === "de" || b.lang === "en") await q("update users set lang = $1 where id = $2", [b.lang, c.get("user").id]);
  return c.json({ ok: true });
});
app.post("/api/me/password", async c => {
  const b = await c.req.json().catch(() => ({}));
  const oldPassword = String(b.oldPassword || "");
  const newPassword = String(b.newPassword || "");
  const u = c.get("user");
  if (newPassword.length < MIN_PASSWORD_LENGTH || newPassword.length > 200) return c.json({ code: "password_too_short" }, 400);
  if (limited("pw:" + u.id)) return c.json({ code: "rate_limited" }, 429);
  const row = await one<{ password_hash: string | null }>("select password_hash from users where id = $1", [u.id]);
  const ok = await verifyPassword(oldPassword, row?.password_hash || await fillerHash());
  if (!row?.password_hash || !ok) return c.json({ code: "invalid_password" }, 400);
  await q("update users set password_hash = $1 where id = $2", [await hashPassword(newPassword), u.id]);
  await endOtherSessions(u.id, getCookie(c, "hey_session"));
  return c.json({ ok: true });
});

// ---- Users (admins only) ----
const adminOnly = async (c: any, next: any) => c.get("user").role === "admin" ? next() : c.json({ code: "forbidden" }, 403);
app.get("/api/admin/users", adminOnly, async c => c.json(await q("select id, login, email, person_id, role, lang, disabled, last_login_at from users order by login")));
app.post("/api/admin/users", adminOnly, async c => {
  const b = await c.req.json().catch(() => ({}));
  const login = String(b.login || b.email || "").trim().toLowerCase();
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  if (!/^[a-z0-9][a-z0-9._@+-]{0,63}$/.test(login) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !["admin", "staff", "leader"].includes(b.role)) return c.json({ code: "invalid_argument" }, 400);
  if (password && password.length < MIN_PASSWORD_LENGTH) return c.json({ code: "invalid_argument" }, 400);
  const existing = await one<{ password_hash: string | null }>("select password_hash from users where email = $1 or login = $2", [email, login]);
  if (!password && !existing?.password_hash) return c.json({ code: "invalid_argument" }, 400);
  const passwordHash = password ? await hashPassword(password) : existing?.password_hash;
  const u = await one(`insert into users (login, email, password_hash, person_id, role, lang) values ($1, $2, $3, $4, $5, $6)
     on conflict (email) do update set login = excluded.login, password_hash = coalesce(excluded.password_hash, users.password_hash),
       person_id = excluded.person_id, role = excluded.role, lang = excluded.lang, disabled = false returning id`,
    [login, email, passwordHash, b.personId || null, b.role, b.lang === "en" ? "en" : "de"]);
  return c.json({ ok: true, id: u.id });
});
app.delete("/api/admin/users/:id", adminOnly, async c => {
  await q("update users set disabled = true where id = $1", [+c.req.param("id")]);
  await q("delete from sessions where user_id = $1", [+c.req.param("id")]);
  return c.json({ ok: true });
});

app.get("/", requireUser, c => {
  if (!cfg.production) DASHBOARD = loadDashboard(); // pick up a rebuilt dashboard without restart
  return c.html(dashboardFor(c.get("user")), 200, { "cache-control": "no-store" });
});

await migrate();
startJobs();
serve({ fetch: app.fetch, port: cfg.port }, i => console.log(`Hey Church team app on ${cfg.appUrl} (port ${i.port})`));
