// Login with an id and a password. Sessions are stored hashed in Postgres.
import { Hono } from "hono";
import type { Context, Next } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { createHash, randomBytes } from "node:crypto";
import { cfg } from "./config.ts";
import { q, one } from "./db.ts";
import { fillerHash, verifyPassword } from "./password.ts";

export type User = { id: number; login: string; email: string; person_id: string | null; role: "admin" | "staff" | "leader"; lang: "de" | "en" };
export type Env = { Variables: { user: User } };

const COOKIE = "hey_session";
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const token = () => randomBytes(32).toString("base64url");

// 8 tries per login id or IP per 15 minutes.
const hits = new Map<string, number[]>();
export function limited(key: string, max = 8, ms = 15 * 60e3) {
  const now = Date.now(), arr = (hits.get(key) || []).filter(t => now - t < ms);
  arr.push(now); hits.set(key, arr); return arr.length > max;
}

export async function userFromRequest(c: Context): Promise<User | null> {
  const sid = getCookie(c, COOKIE); if (!sid) return null;
  const u = await one<User>(
    `select u.id, u.login, u.email, u.person_id, u.role, u.lang from sessions s join users u on u.id = s.user_id
     where s.id_hash = $1 and s.expires_at > now() and not u.disabled`, [sha(sid)]);
  return u || null;
}

// Requires a session. API calls get 401, page loads are sent to the login page.
export async function requireUser(c: Context<Env>, next: Next) {
  const u = await userFromRequest(c);
  if (!u) return c.req.path.startsWith("/api/") ? c.json({ code: "session_expired" }, 401) : c.redirect("/login");
  c.set("user", u); await next();
}

// Mutating API calls must come from our own pages (custom header can't be sent cross-site without CORS).
export async function requireClientHeader(c: Context, next: Next) {
  if (c.req.method !== "GET" && c.req.header("x-hey-client") !== "1") return c.json({ code: "forbidden" }, 403);
  await next();
}

async function startSession(c: Context, userId: number) {
  const sid = token();
  await q("insert into sessions (id_hash, user_id, expires_at) values ($1, $2, now() + ($3 || ' days')::interval)", [sha(sid), userId, String(cfg.sessionDays)]);
  await q("update users set last_login_at = now() where id = $1", [userId]);
  // Host-only cookie. Do not set Domain: `.heylifeapp.de` would send this session to the Hey Life apex and API.
  setCookie(c, COOKIE, sid, { httpOnly: true, secure: cfg.production, sameSite: "Lax", path: "/", maxAge: cfg.sessionDays * 86400 });
}

export const auth = new Hono<Env>();

auth.post("/api/auth/login", requireClientHeader, async c => {
  const body = await c.req.json().catch(() => ({}));
  const login = String(body.login || "").trim().toLowerCase().slice(0, 64);
  const password = String(body.password || "");
  const ip = c.req.header("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!login || !password) return c.json({ code: "invalid_login" }, 401);
  if (limited("id:" + login) || limited("ip:" + ip, 30)) return c.json({ code: "rate_limited" }, 429);
  const u = await one<{ id: number; disabled: boolean; password_hash: string | null }>(
    "select id, disabled, password_hash from users where login = $1", [login]);
  const ok = await verifyPassword(password, u?.password_hash || await fillerHash());
  if (!u || u.disabled || !u.password_hash || !ok) return c.json({ code: "invalid_login" }, 401);
  await startSession(c, u.id);
  return c.json({ ok: true });
});

// Drops every session except the browser that just changed the password.
export async function endOtherSessions(userId: number, currentSid: string | undefined) {
  if (!currentSid) return;
  await q("delete from sessions where user_id = $1 and id_hash <> $2", [userId, sha(currentSid)]);
}

auth.post("/api/auth/logout", requireClientHeader, async c => {
  const sid = getCookie(c, COOKIE);
  if (sid) await q("delete from sessions where id_hash = $1", [sha(sid)]);
  deleteCookie(c, COOKIE, { path: "/" });
  return c.json({ ok: true });
});
