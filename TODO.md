# TODO

Handoff for the next agent. Finish moving the leadership dashboard from [saifookhan/heychurch](https://github.com/saifookhan/heychurch) to [office718/Hey-Life](https://github.com/office718/Hey-Life). The live site stays [https://team.heylifeapp.de/](https://team.heylifeapp.de/) on the existing Contabo VPS.

Pull request: https://github.com/office718/Hey-Life/pull/1
Branch: `cursor/team-app-51e0`

Do the open items in order. The cloud agent token (`cursor[bot]`) gets HTTP 403 on this repository. Push from a `saifookhan` session.

## Already on GitHub (`869d4ed`)

- [x] `team/app` is the dashboard, package `@heychurch/team`, standalone pnpm. It does not share dependencies with the Vite app.
- [x] `team/infra` has the Dockerfile, Compose project, and `ensure-team-env.py`. `.github/workflows/team-deploy.yml` deploys it.
- [x] Names that must stay: Compose project `heychurch-team`, containers `heychurch-team` and `heychurch-team-db`, network `heylife_internal`, Postgres directory `${DATA_DIR}/team-postgres`, domain `team.heylifeapp.de`.

## Open

- [x] If `firebase-app-old/` does not exist, move the retired Vite app there. From the repo root, `git mv` these paths into `firebase-app-old/`: `App.tsx`, `components`, `config.js`, `constants`, `contexts`, `env.js`, `firebase.json`, `firebase`, `firestore.rules`, `i18n`, `index.html`, `index.tsx`, `layouts`, `manifest.json`, `metadata.json`, `package-lock.json`, `package.json`, `pages`, `public`, `robots.txt`, `services`, `sw.js`, `tsconfig.json`, `types.ts`, `vite.config.ts`. Leave `team/`, `.github/`, and this file at the root. Replace the root `README.md` with pointers to `team/app/README.md` and `firebase-app-old/README.md`. Add `firebase-app-old/README.md` (retired, not deployed, `npm install` / `GEMINI_API_KEY` / `npm run dev`) and `firebase-app-old/.gitignore` (`node_modules`, `dist`, `.env.local`). In `team/app/README.md`, say the retired Vite app is `firebase-app-old/`, not the repository root.
- [x] Fix `firebase-app-old` so `npx tsc --noEmit` exits 0. In `i18n/translations.ts`, delete the second German block of `home.greeting.morning`, `home.greeting.afternoon`, and `home.greeting.evening` (the one directly above `home.spirit_snack.badge`). In `pages/AdminPage.tsx`, import `useLanguage` from `../contexts/LanguageContext`, call `const { t } = useLanguage()` inside `CourseEditor`, and replace `firebaseService.t(p.title)` with `t(p.title)`.
- [x] In `team/app`, run `pnpm install`, then `pnpm test` and `pnpm typecheck`. `pnpm-workspace.yaml` must allow the esbuild build script.
- [x] On `office718/Hey-Life`, add repository secrets with the same values as the `testing` environment on `saifookhan/heychurch`: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`, `VPS_REPO_DIR`. `VPS_REPO_DIR` is the heychurch checkout on the VPS. `TEAM_*` already live in that checkout's `code/infra/.env`. Do not print the values.
- [ ] Merge pull request #1 into `main`. A push to `main` that touches `team/**` runs Deploy team. The job clones this repo as a sibling of `VPS_REPO_DIR` (`dirname(VPS_REPO_DIR)/Hey-Life`), runs `team/infra/ensure-team-env.py` against the heychurch `code/infra` directory, and starts `team/infra/docker-compose.yml` with that `.env`.
- [ ] Confirm the deploy kept the existing database. `https://team.heylifeapp.de/health` returns `{"ok":true}`. The `users` count in `heychurch-team-db` is not zero and did not drop. Sign in at `https://team.heylifeapp.de/login` as `lea` with the demo password in the pull request description (`HeyChurch-Demo-2026`). Do not run `scripts/seed.ts` when users or documents already exist. The workflow seeds only when both counts are 0.
- [ ] After that health check passes, stop `saifookhan/heychurch` from deploying the old dashboard onto the same containers. Remove `code/apps/team`, `code/infra/team/`, `code/infra/docker-compose.team.yml`, and `.github/workflows/team-deploy.yml`. Update the docs that still say the dashboard lives in `code/apps/team` (`README.md`, `code/docs/RELEASE.md`, `code/docs/DIARY.md`, `code/docs/infra/heylifeapp-de-domain.md`). Leave `code/infra/team-site.caddy`. Leave `code/infra/ensure-team-env.py` while `.github/workflows/deploy.yml` still runs it.

## Do not change

- Domain: `team.heylifeapp.de`.
- Container names: `heychurch-team`, `heychurch-team-db`. Compose project name: `heychurch-team`.
- Postgres data: `${DATA_DIR}/team-postgres`. Do not create a new volume and do not delete the old one.
- Docker network: external `heylife_internal`, created by the heychurch stack. Caddy proxies `heychurch-team:3000`.
- `team-site.caddy` stays in the heychurch checkout because Caddy bind-mounts that file. `team/infra/ensure-team-env.py` rewrites it on deploy.
- `firebase-app-old/` is retired. Do not deploy it and do not fold it into the `team/` package.
