// Morning push: "You have N tasks today" for everyone with a linked person and a device.
import cron from "node-cron";
import { cfg } from "./config.ts";
import { q } from "./db.ts";
import { pushToPerson } from "./notify.ts";

const todayIso = () => new Intl.DateTimeFormat("sv-SE", { timeZone: cfg.tz }).format(new Date()); // YYYY-MM-DD

export async function morningBriefing() {
  const day = todayIso();
  const rows = await q<{ person_id: string; lang: string; due_today: string; overdue: string }>(
    `select u.person_id, min(u.lang) as lang,
            count(t.id) filter (where t.data->>'due' = $1) as due_today,
            count(t.id) filter (where t.data->>'due' < $1 and t.data->>'due' <> '') as overdue
       from users u
       join push_subscriptions s on s.user_id = u.id
       left join documents t on t.collection = 'tasks' and t.data->>'owner' = u.person_id and coalesce((t.data->>'done')::boolean, false) = false
      where not u.disabled and u.person_id is not null
      group by u.person_id`, [day]);
  for (const r of rows) {
    const n = +r.due_today, late = +r.overdue;
    if (!n && !late) continue;
    const en = r.lang === "en";
    const body = en
      ? `${n} task${n === 1 ? "" : "s"} for today${late ? `, ${late} overdue` : ""}. Start with your priorities.`
      : `${n} Aufgabe${n === 1 ? "" : "n"} für heute${late ? `, ${late} überfällig` : ""}. Starte mit deinen Prioritäten.`;
    await pushToPerson(r.person_id, en ? "Good morning" : "Guten Morgen", body, "/");
  }
}

export function startJobs() {
  if (!cfg.briefingCron) return;
  cron.schedule(cfg.briefingCron, () => { morningBriefing().catch(e => console.error("briefing", e)); }, { timezone: cfg.tz });
}
