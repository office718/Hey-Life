# Hey Church Team – the leadership dashboard as our own app

This is the Hey Church leadership dashboard (Mein Tag, Wochenplan, Team, Wachstum, Meetings, Newsletter …) running on our own server, with:

- **Login with an id and a password.** Email is only for notifications (Resend). On My day, Password asks for the current password and saves a new one.
- **Everyone sees their own view.** Leaders see their area; private things stay with the person and the people above them (docs/access.md).
- **Live updates.** When Victor ticks a task, Michi sees it right away.
- **Push notifications** on phone and desktop, with email as fallback, and a morning push "N tasks today".
- **Claude features** (meeting → tasks, newsletter drafts, requests, identity statement) through the church's own Anthropic API key.
- **Installable as an app** on iPhone/Android (PWA: "Zum Home-Bildschirm").
- German by default, English switch. Fonts are served from our server (no Google Fonts, GDPR).

The dashboard itself (`dashboard/hey-church-dashboard.html`) is the same file that runs today in Claude. `public/claude-bridge.js` replaces Claude's runtime with this server's API, so nothing in the dashboard had to change. Building React screens later is possible step by step (see CLAUDE.md, roadmap).

## Stack

Node 26 + TypeScript (run with tsx, no build step) · Hono · PostgreSQL 16 · web-push · Resend · Docker Compose · Caddy (automatic HTTPS).

```
src/server.ts      pages, fonts, security headers, admin API, starts everything
src/auth.ts        id and password login, sessions (hashed), CSRF header check
src/access.ts      who sees and changes what  ← the important file
src/data.ts        /api/data/:collection  (GET list, POST create, PUT set, PATCH merge, DELETE)
src/realtime.ts    /api/stream  (Server-Sent Events: "tasks changed")
src/notify.ts      push + email for notifications
src/ai.ts          /api/ai  → Anthropic Messages API
src/jobs.ts        morning push
public/            bridge, service worker, login page, manifest, icons
dashboard/         the dashboard (built file, English source, translation build)
data/              current data from the Claude version (one JSON file per record) – personal data!
migrations/        SQL
```

## Where this runs

This package is `team/app` in [office718/Hey-Life](https://github.com/office718/Hey-Life). It is a separate app from the Vite project at the repository root: its own Postgres database, its own logins, and its own hostname `https://team.heylifeapp.de/`. It does not use the Hey Life schema, Better Auth, or the apex site.

The image and Compose project live in `team/infra`. Caddy on the Hey Life stack (the heychurch checkout on the same Contabo VPS) proxies the hostname. Runtime secrets are `TEAM_*` in that server's `code/infra/.env`. The database directory is the existing `${DATA_DIR}/team-postgres` volume. A merge to `main` that changes `team/` deploys this app on its own.

## Run it locally

```bash
cd team/app
pnpm install
docker compose -f ../infra/docker-compose.dev.yml up -d
cp .env.example .env
pnpm seed         # demo logins, local database only
pnpm dev          # http://localhost:3000
```

The seed adds three fictional logins and a small team around them. It refuses `NODE_ENV=production` and `https://team.heylifeapp.de`, and it only writes documents whose ids start with `demo-`. Every demo id uses the password `HeyChurch-Demo-2026`.

| Id | Role | Person |
|---|---|---|
| `ada` | admin | Ada Demo |
| `sam` | staff | Sam Demo |
| `lea` | leader | Lea Demo |

Push keys, once, then paste the two lines into env and do not regenerate them:

```bash
pnpm vapid
```

Tests: `pnpm test` (access rules) and `pnpm typecheck`.

## Changing the dashboard

Edit the English master `dashboard/hey-church-dashboard.source.html`, add new German texts to `dashboard/i18n/tr.json`, then `pnpm build:dashboard`. The built file is `dashboard/hey-church-dashboard.html`. Never edit the built file by hand.

## Data from the Claude version

`data/` is the export of 23 Oct 2026 and is gitignored. Until the switch, the team keeps working in the Claude version, so do a fresh export right before go-live and import it with `--replace` on the production server only. After go-live, the server is the only place where data lives. The testing server stays empty.

## Before go-live – checklist

- [ ] Real logo in `public/icon.svg` and the PNG icons (192, 512, 180)
- [ ] Resend domain verified, a notification email arrives (also check spam)
- [ ] VAPID keys set, push tested on one iPhone and one Android
- [ ] Anthropic key set, try "Meeting → Aufgaben" once
- [ ] Logins created for everyone, roles checked against docs/access.md
- [ ] Backups run and one restore tested
- [ ] Data protection: add the app to the church's Verzeichnis der Verarbeitungstätigkeiten; AV-Verträge (DPA) with the host, Resend and Anthropic
