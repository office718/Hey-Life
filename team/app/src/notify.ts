// Push messages (Web Push) with email (Resend) as fallback.
import webpush from "web-push";
import { Hono } from "hono";
import { cfg } from "./config.ts";
import { q } from "./db.ts";
import type { Env } from "./auth.ts";

const pushReady = !!(cfg.vapidPublic && cfg.vapidPrivate);
if (pushReady) webpush.setVapidDetails(cfg.vapidSubject, cfg.vapidPublic, cfg.vapidPrivate);

/** Sends an email through Resend. Returns false when email is not configured or fails. */
export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  if (!cfg.resendKey) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: cfg.mailFrom, to: [to], subject, text }),
    });
    if (!r.ok) console.error("resend", r.status, await r.text());
    return r.ok;
  } catch (e) { console.error("resend", e); return false; }
}

/** Pushes to every device of the person. Returns how many devices got it. */
export async function pushToPerson(personId: string, title: string, body: string, url = "/"): Promise<number> {
  if (!pushReady) return 0;
  const subs = await q<{ id: number; endpoint: string; p256dh: string; auth: string }>(
    `select s.* from push_subscriptions s join users u on u.id = s.user_id where u.person_id = $1 and not u.disabled`, [personId]);
  let n = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ title, body, url }), { TTL: 86400 });
      n++;
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) await q("delete from push_subscriptions where id = $1", [s.id]); // device gone
      else console.error("push", e?.statusCode || e);
    }
  }
  return n;
}

/** Called after a notification ("notes" document) is created in the dashboard. */
export async function onNoteCreated(note: { to?: string; text?: string; kind?: string }) {
  if (!note.to) return;
  // keep the newest N notifications per person
  await q(`delete from documents where collection = 'notes' and id in (
            select id from documents where collection = 'notes' and data->>'to' = $1
            order by (data->>'at')::bigint desc nulls last offset $2)`, [note.to, cfg.notesKeepPerPerson]);
  const text = String(note.text || "").slice(0, 300);
  const sent = await pushToPerson(note.to, "Hey Church", text);
  if (sent) return;
  const users = await q<{ email: string; lang: string }>("select email, lang from users where person_id = $1 and not disabled", [note.to]);
  for (const u of users) {
    await sendEmail(u.email, u.lang === "en" ? "New in the Hey Church dashboard" : "Neu im Hey Church Dashboard",
      `${text}\n\n${cfg.appUrl}`);
  }
}

export const push = new Hono<Env>();
push.get("/api/push/key", c => c.json({ key: pushReady ? cfg.vapidPublic : "" }));
push.post("/api/push/subscribe", async c => {
  const s = await c.req.json().catch(() => null);
  if (!s?.endpoint || !s?.keys?.p256dh || !s?.keys?.auth) return c.json({ code: "invalid_argument" }, 400);
  await q(`insert into push_subscriptions (user_id, endpoint, p256dh, auth) values ($1, $2, $3, $4)
           on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth`,
    [c.get("user").id, s.endpoint, s.keys.p256dh, s.keys.auth]);
  return c.json({ ok: true });
});
push.post("/api/push/unsubscribe", async c => {
  const s = await c.req.json().catch(() => ({}));
  await q("delete from push_subscriptions where endpoint = $1 and user_id = $2", [String(s.endpoint || ""), c.get("user").id]);
  return c.json({ ok: true });
});
