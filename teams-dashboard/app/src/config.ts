// All settings come from environment variables (see .env.example).
const env = process.env;
const num = (v: string | undefined, d: number) => (v && !isNaN(+v) ? +v : d);

export const cfg = {
  port: num(env.PORT, 3000),
  appUrl: (env.APP_URL || "http://localhost:3000").replace(/\/$/, ""),
  production: env.NODE_ENV === "production",
  databaseUrl: env.DATABASE_URL || "postgres://hey:hey@localhost:5432/hey",
  sessionDays: num(env.SESSION_DAYS, 60),
  tz: env.TZ || "Europe/Berlin",

  resendKey: env.RESEND_API_KEY || "",
  mailFrom: env.RESEND_FROM || "Hey Church <team@heychurch.de>",

  vapidPublic: env.VAPID_PUBLIC_KEY || "",
  vapidPrivate: env.VAPID_PRIVATE_KEY || "",
  vapidSubject: env.VAPID_SUBJECT || "mailto:office@heychurch.de",

  anthropicKey: env.ANTHROPIC_API_KEY || "",
  anthropicModel: env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
  aiPerUserPer10Min: num(env.AI_LIMIT_PER_10_MIN, 40),

  briefingCron: env.BRIEFING_DAILY_CRON || "30 7 * * 1-6",
  notesKeepPerPerson: num(env.NOTIFICATIONS_KEEP_PER_PERSON, 30),
};
