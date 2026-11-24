# teams-dashboard

Leadership dashboard for Hey Church Hamburg. Leaders see their day, tasks, meetings, and the people who report to them. German is the default language. English is the switch in the header.

The folder name in this repository is `teams-dashboard`. The public URL stays https://team.heylifeapp.de/.

## Layout

```
teams-dashboard/
  app/                 Node server, dashboard, tests, migrations
  infra/               Dockerfile, Compose, env filler for the VPS
```

`app/` is the package `@heychurch/team`. It does not share dependencies with `firebase-app-old/`.

| Path | What it is |
|---|---|
| `app/src/server.ts` | HTTP server. Pages, fonts, `/api/me`, admin users, starts jobs. |
| `app/src/auth.ts` | Login id + password. Sessions are stored hashed. Mutating API calls need the header `x-hey-client: 1`. |
| `app/src/access.ts` | Who can read and write each collection. Change this only with a test in `app/test/access.test.ts`. |
| `app/src/data.ts` | `/api/data/:collection` for the dashboard records. |
| `app/src/realtime.ts` | Server-sent events. The browser refetches a collection when it changes. |
| `app/src/notify.ts` | Web push, then email if there is no push device. |
| `app/src/ai.ts` | Claude calls. Hidden when `ANTHROPIC_API_KEY` is empty. |
| `app/src/jobs.ts` | Morning push. Cron is `BRIEFING_DAILY_CRON`. |
| `app/public/claude-bridge.js` | Makes the dashboard's `window.claude` calls hit this API. |
| `app/public/login.html` | Login page at `/login`. |
| `app/dashboard/hey-church-dashboard.source.html` | English source of the single-page dashboard. Edit this file. |
| `app/dashboard/hey-church-dashboard.html` | Built file the server sends. Do not edit it by hand. |
| `app/dashboard/i18n/tr.json` | German strings for the dashboard. |
| `app/migrations/` | SQL applied on startup. |
| `app/docs/access.md` | Who sees what, in prose. |
| `app/docs/data-model.md` | Collections and fields. |
| `infra/Dockerfile` | Image. Build context is `teams-dashboard/`. |
| `infra/docker-compose.yml` | Production Compose project. |
| `infra/docker-compose.dev.yml` | Local Postgres only, on port 5433. |
| `infra/ensure-team-env.py` | Fills missing `TEAM_*` keys and rewrites Caddy's site file on the VPS. It does not print secret values. |

## What is already set in production

These names are live. Do not rename them to match the folder. A new name would start a second database or miss the proxy.

| Thing | Value |
|---|---|
| Public URL | `https://team.heylifeapp.de/` |
| Compose project | `heychurch-team` |
| App container | `heychurch-team` (Compose service `team`, port 3000) |
| Database container | `heychurch-team-db` (Compose service `team-db`, database `hey`, user `hey`) |
| Docker network | external `heylife_internal`, created by the heychurch stack |
| Postgres files | `${DATA_DIR}/team-postgres` on the VPS. Do not create a new volume and do not delete this one. |
| Import directory | `TEAM_DATA_DIR`, mounted read-only at `/import-data` |
| Caddy site file | `code/infra/team-site.caddy` in the heychurch checkout. Caddy bind-mounts that file. This repo rewrites it on deploy. |
| Deploy workflow | `.github/workflows/teams-dashboard-deploy.yml` |

The heychurch checkout on the VPS is `/heychurch`. This repo is cloned beside it as `/Hey-Life`. GitHub Actions secrets on `office718/Hey-Life` are `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`, and `VPS_REPO_DIR` (`/heychurch`). The SSH user is `deploy`.

## Settings

Production values live in `/heychurch/code/infra/.env` under `TEAM_*` names. Compose maps them onto the names the Node process reads. Local values live in `app/.env`, which is gitignored. Copy it from `app/.env.example`.

| Process env | Production env | Empty means |
|---|---|---|
| `APP_URL` | `TEAM_APP_URL` | local default `http://localhost:3000` |
| `DATABASE_URL` | `TEAM_DATABASE_URL` | required in production |
| `RESEND_API_KEY` | `TEAM_RESEND_API_KEY` | no email is sent |
| `RESEND_FROM` | `TEAM_RESEND_FROM` | `Hey Church <team@heylifeapp.de>` |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | `TEAM_VAPID_*` | no web push. Generate once with `pnpm vapid` and do not rotate. |
| `VAPID_SUBJECT` | `TEAM_VAPID_SUBJECT` | `mailto:office@heychurch.de` |
| `ANTHROPIC_API_KEY` | `TEAM_ANTHROPIC_API_KEY` | Claude buttons stay hidden |
| `ANTHROPIC_MODEL` | `TEAM_ANTHROPIC_MODEL` | `claude-sonnet-5-5` |
| `SENTRY_DSN` | `TEAM_SENTRY_DSN` | no error reporting |
| `NODE_ENV` | `NODE_ENV` | `production` in the container |

Also required in that same `.env`, and not renamed: `DATA_DIR`, `TEAM_POSTGRES_PASSWORD`, `TEAM_DATA_DIR`, `TEAM_DOMAIN`. `ensure-team-env.py` adds a missing key. It does not replace a key that already has a value, and it does not move the Postgres directory.

`app/.env.example` lists the local shape, including `SESSION_DAYS`, `AI_LIMIT_PER_10_MIN`, `BRIEFING_DAILY_CRON`, and `NOTIFICATIONS_KEEP_PER_PERSON`.

## How a signed-in session works

1. `POST /api/auth/login` with `{ login, password }` and header `x-hey-client: 1` sets the cookie `hey_session`.
2. The cookie is host-only. It is not sent to the Hey Life apex.
3. `GET /` injects `window.__HEY` (`me`, `login`, `email`, `lang`, `role`) and serves the built dashboard.
4. The header has **Log out**, which calls `POST /api/auth/logout` and returns to `/login`.
5. On My day, the signed-in person has **Profile** (name and notification email) and **Password**.
6. `PATCH /api/me` saves `email` and `lang`. The name is a field on that person's document. A leader can change their own name. They cannot change role, who they report to, order, budget, or studio.

## Run it locally

From `teams-dashboard/app`, with Node 26 (the app also runs on Node 24 with an engine warning):

```bash
pnpm install
docker compose -f ../infra/docker-compose.dev.yml up -d
cp .env.example .env
pnpm seed
pnpm dev
```

Open http://localhost:3000. `pnpm seed` refuses `NODE_ENV=production` and refuses `APP_URL=https://team.heylifeapp.de`. It only writes documents whose ids start with `demo-`.

| Id | Password | Role | Person |
|---|---|---|---|
| `ada` | `HeyChurch-Demo-2026` | admin | Ada Demo |
| `sam` | `HeyChurch-Demo-2026` | staff | Sam Demo |
| `lea` | `HeyChurch-Demo-2026` | leader | Lea Demo |

`pnpm test` and `pnpm typecheck` do not need the database.

## Change the dashboard

1. Edit `app/dashboard/hey-church-dashboard.source.html`.
2. Add the German string to `app/dashboard/i18n/tr.json`.
3. Run `pnpm build:dashboard`.
4. Leave `hey-church-dashboard.html` as the build output.

Sunday services are called **Celebration**, never "Gottesdienst". Use **prägen** for how the church shapes people. Write to the reader in du-form.

## Deploy

A push to `main` that changes `teams-dashboard/**` or the workflow file runs Deploy teams-dashboard. The job SSHs to the VPS, checks out this commit in `/Hey-Life`, runs `teams-dashboard/infra/ensure-team-env.py` against `/heychurch/code/infra`, and starts `teams-dashboard/infra/docker-compose.yml` with that `.env`. It recreates Caddy so the site file is picked up.

The job seeds demo users only when both `users` and `documents` are 0. Do not run `scripts/seed.ts` on the server when either count is already above 0.

## Retired app

`firebase-app-old/` at the repository root is the old Vite app. Do not deploy it and do not move it into this package.
