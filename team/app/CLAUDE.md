# Hey Church Team app – notes for Claude Code

## Context
Hey Church Hamburg (Wandsbek). Mission: "Wir helfen Menschen, Jesus zu folgen." This app is the leadership dashboard: every leader sees their tasks, priorities, rhythm and meetings; the Lead Team runs its weekly meeting and one-to-ones in it.
People: Victor (Lead Pastor, admin), Michi (Pastor of Operations, admin), Moses (NextGen Pastor), department leaders Goddy (First Impression), Andinia (Welcome), Tai (Streaming), Hami (Social Media only), Mona (Worship Coordinator), Tracy (Newsletter owner).

## Wording (important in all German texts)
- Sunday services are **"Celebration"**, never "Gottesdienst".
- **"prägen"** for how the church shapes people and leaders.
- Du-form, warm and short. German is the default language, English is the switch.
- "Highlights" and "Lowlights" of the week; "Hey Fams" for small groups; five dimensions: Jesus folgen, Beziehungen vertiefen, Anderen dienen, Glauben teilen, Großzügig investieren.

## Architecture
- `dashboard/hey-church-dashboard.html` is a single-file app built for Claude's artifact runtime (`window.claude.use("db" | "sample" | "user")`). `public/claude-bridge.js` implements that runtime against our API. Keep the bridge's behaviour identical: `collection(c).onSnapshot/add/doc`, `db.doc("c/id").set/update/delete`, update = top-level merge, errors carry `.code`.
- Server: Hono on Node 26, TypeScript run by tsx. Postgres table `documents (collection, id, data jsonb)`. Collections are listed in `src/access.ts`.
- Live updates: SSE `/api/stream` sends the collection name; the bridge refetches it. One process only (for more, use Postgres LISTEN/NOTIFY).
- Every mutating `/api` call needs the header `x-hey-client: 1` (CSRF) and a session cookie.

## Commands
`npm run dev` · `npm test` · `npm run typecheck` · `npm run seed` · `npm run import [-- --replace]` · `npm run add-user -- login password email personId role [de|en]` · `npm run vapid` · `npm run build:dashboard`

## Rules
- **Never weaken `src/access.ts`.** Every rule change gets a test in `test/access.test.ts`. Reads are filtered on the server, never only in the browser.
- No passwords or logins of church accounts are stored in the app (they live in the church's shared Google document).
- Personal and health details from meetings are not stored in shared records.
- No Google Fonts or other third-party CDNs (GDPR); vendor files are served from our server.
- Keep German twin fields (`...De`) when changing the data model (docs/data-model.md).
- Dashboard changes: edit `dashboard/hey-church-dashboard.source.html` (English), add German to `dashboard/i18n/tr.json`, run `npm run build:dashboard`.

## Roadmap (agreed so far)
1. Go live with this version by the end of 2026, onboarding of all leaders.
2. Richer morning briefing (today's meetings, Sunday's sermon and dimension, team completions); weekly summary for volunteer leaders; one-to-one reminder (docs/data-model.md, scheduled jobs).
3. Planning Center sync (people, holidays, serving plans) to plan preachers and see who is away.
4. Mailchimp: send the finished newsletter (Tracy's studio) as a draft campaign.
5. Move screens to React one by one behind the same API, starting with "Mein Tag". Native app (React Native) only if the PWA is not enough.
