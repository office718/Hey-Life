// Fictional demo logins and the few records they need to open the dashboard.
// Not church data. Ids start with demo- so a later import of the real export does not collide.
// Re-running the seed overwrites these documents (dates stay relative to today).

export type DemoUser = {
  login: string;
  password: string;
  email: string;
  personId: string;
  role: "admin" | "staff" | "leader";
  lang: "de" | "en";
};

/** Local demo password. The seed refuses the public server, so this never belongs there. */
export const DEMO_PASSWORD = "HeyChurch-Demo-2026";

export const DEMO_USERS: DemoUser[] = [
  { login: "ada", password: DEMO_PASSWORD, email: "ada.demo@demo.heychurch.test", personId: "demo-ada", role: "admin", lang: "de" },
  { login: "sam", password: DEMO_PASSWORD, email: "sam.demo@demo.heychurch.test", personId: "demo-sam", role: "staff", lang: "de" },
  { login: "lea", password: DEMO_PASSWORD, email: "lea.demo@demo.heychurch.test", personId: "demo-lea", role: "leader", lang: "de" },
];

export type DemoDoc = { collection: string; id: string; data: Record<string, unknown> };

/** Calendar day in Europe/Berlin, plus `offset` days, as YYYY-MM-DD. */
export function berlinDay(offset = 0, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const y = Number(parts.find(p => p.type === "year")!.value);
  const m = Number(parts.find(p => p.type === "month")!.value);
  const d = Number(parts.find(p => p.type === "day")!.value);
  return new Date(Date.UTC(y, m - 1, d + offset)).toISOString().slice(0, 10);
}

export function demoDocuments(today = berlinDay(), now = Date.now()): DemoDoc[] {
  const person = (id: string, data: Record<string, unknown>): DemoDoc => ({ collection: "people", id, data });
  const task = (id: string, data: Record<string, unknown>): DemoDoc => ({ collection: "tasks", id, data: { createdAt: now, ...data } });
  return [
    person("demo-ada", {
      name: "Ada Demo", nameDe: "Ada Demo", role: "Lead Pastor", roleDe: "Leitende Pastorin", order: 1,
      summary: "Demo lead pastor. Sees and changes everything, including logins.",
      summaryDe: "Demo: Leitende Pastorin. Sieht und ändert alles, auch die Logins.",
      idWho: "Demo identity, visible to Ada and nobody below her.",
      goal: "A dashboard people can try without real church data.",
      why: "So each role has a login.",
      support: "None. This is seed data.",
      focus: 3,
    }),
    person("demo-sam", {
      name: "Sam Demo", nameDe: "Sam Demo", role: "Pastor of Operations", roleDe: "Pastor of Operations",
      reports: "demo-ada", order: 2,
      summary: "Demo staff login. Sees and changes the team's work.",
      summaryDe: "Demo: Staff-Login. Sieht und ändert die Arbeit des Teams.",
    }),
    person("demo-lea", {
      name: "Lea Demo", nameDe: "Lea Demo", role: "Welcome", roleDe: "Willkommen",
      reports: "demo-sam", order: 3,
      summary: "Demo department leader. Sees her own area.",
      summaryDe: "Demo: Bereichsleitung. Sieht den eigenen Bereich.",
    }),
    person("demo-kim", {
      name: "Kim Demo", nameDe: "Kim Demo", role: "Welcome team", roleDe: "Willkommensteam",
      reports: "demo-lea", order: 4,
      summary: "Reports to Lea. No login of their own.",
      summaryDe: "Berichtet an Lea. Kein eigenes Login.",
      idWho: "Private growth note. Lea and the people above her can read this. A leader outside this chain cannot.",
    }),
    task("demo-task-ada", { title: "Celebration am Sonntag vorbereiten", owner: "demo-ada", due: today, area: "General" }),
    task("demo-task-lea", { title: "Willkommensteam briefen", owner: "demo-lea", due: today, area: "General" }),
    task("demo-task-kim-growth", { title: "Identitätssatz schreiben", owner: "demo-kim", due: today, area: "Growth" }),
    task("demo-task-kim", { title: "Namensschilder drucken", owner: "demo-kim", due: berlinDay(-1, new Date(now)), area: "General", done: true, doneAt: berlinDay(-1, new Date(now)) }),
    { collection: "meetings", id: "demo-meet-welcome", data: { title: "Willkommen wöchentlich", date: today, rhythmId: "demo-welcome", notes: "Demo team meeting. Leaders can see this.", createdAt: now } },
    { collection: "meetings", id: "demo-meet-lead", data: { title: "Lead Team", date: today, rhythmId: "leadteam", notes: "Demo. Leaders do not see Lead Team meetings.", createdAt: now } },
    { collection: "meetings", id: "demo-meet-kim", data: { title: "Gespräch mit Kim", date: today, personId: "demo-kim", notes: "Demo one-to-one. Lea and the people above her can see this.", createdAt: now } },
    { collection: "rhythms", id: "demo-welcome", data: { name: "Welcome weekly", nameDe: "Willkommen wöchentlich", every: "week", weekday: 2, nth: 1, who: "Lea Demo", goal: "Guests feel expected.", goalDe: "Gäste fühlen sich erwartet.", agenda: "Arrivals\nName tags" } },
    { collection: "notes", id: "demo-note-lea", data: { to: "demo-lea", kind: "task", text: "Sam Demo: Willkommensteam briefen", from: "demo-sam", at: now } },
  ];
}
