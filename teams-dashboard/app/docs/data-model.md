# Data model, notifications and scheduled jobs

In the database every record is one row in `documents` (collection, id, data as JSON). For import and backup each record is a file `data/<collection>/<id>.json`. Dates are `YYYY-MM-DD` in Europe/Berlin; `createdAt` and `at` are milliseconds since 1970.

## Collections

| Collection | One record is | Main fields |
|---|---|---|
| `people` | A person or an open position on the chart | `name`, `role`, `reports` (id of their leader), `order`, `unit` (true for the Church Board), `vacant` (true for an open position), `summary`, `duties`, `wins`, `zoneAlone`, `zoneInform`, `zoneAsk`, `identity`, `idWho`, `idFor`, `idGift`, `idBecome`, `goal`, `why`, `strategy`, `goalBy`, `goalStatus`, `support`, `sabbath`, `family`, `focus` (1 to 5), `focusHow`, `prio` (`{"2026-Q4": [{t, done}]}`), `second` (number two), `fillOwner`, `fillBy`, `candidates`, `studio` (`social` or `youtube`), `budget` (yearly department budget in euros), `alloc` (`[{what, amount}]`, how the leader allocates it), `budgets` (department budget per year: `{"2027": {wish, wishNote, wishAt, wishBy, approved, approvedAt, approvedBy, alloc: [{what, amount}]}}`; the leader enters the desired budget for the next year by 30 September, the person above approves it; spending is the `spend` records with owner `dept:<person>` in that year; the old single `budget` field is no longer used), `cfocus` (the leadership commitment chosen per quarter: `{"2027-Q1": {c: 2–5, how}}`; c is the position in the list of five commitments, 1 = Wir leben es vor is the frame for all) |
| `tasks` | A task | `title`, `note`, `owner`, `due`, `repeat` (`daily`, `weekly`, `monthly`), `area`, `dim`, `meetingId`, `projectId`, `requestId`, `done`, `doneAt`, `lastDone`, `prevDue`, `doneNote` (what happened), `celebrated` (date), `createdAt` |
| `meetings` | A recorded meeting | `title`, `date`, `notes`, `decisions` (one per line), `rhythmId`, `personId` (for one-to-ones), `projectId` (for project meetings), `createdAt` |
| `rhythms` | A recurring meeting | `name`, `every` (`week`, `month`, `person`, `project`), `nth`, `weekday` (0 = Sunday), `who`, `goal` (the win), `agenda` (one item per line: `Title \| Question \| block`) |
| `weeks` | One Sunday of the preaching plan (id = the date; a few special services such as Heiligabend are on their own date) | `series`, `title`, `subtitle`, `ask`, `text`, `verse`, `core`, `dim`, `idea`, `fast`, `extras`, `readings`, `preacher`, `points` (teaching points, at most 5: `[{t: truth to write down, v: Bible reference, k: key word left blank on the notes sheet, n: one sentence for life}]`) |
| `metrics` | A scorecard measure | `name`, `dim`, `target`, `unit`, `value`, `updatedAt`, `prev`, `prevAt`, `order` |
| `pulses` | One person's weekly heart check (id `person_week`, week = Monday). From January 2027: `kind: "heart"`, `pid`, `week`, `god` (where I saw God at work), `drive` (`god`, `idol` = this month's idol, `other`), `driveText`, `commitQ` and `commit` (question and answer for the quarter's commitment), `step`, `at`. Older records (`sabbath`, `family`, `load`) are the former rhythm check and are no longer shown. |
| `seen` | A person in the "I see in you" pipeline | `name`, `what`, `by`, `owner`, `stage` (`spotted`, `talked`, `step`, `serving`, `leading`), `at`, `stageAt` |
| `stops` | An item on the quarter's stop list | `text`, `quarter` (`2026-Q4`), `by`, `at` |
| `notes` | One notification | `to`, `kind`, `text`, `from`, `at` |
| `content` | Drafted Instagram posts or a YouTube package for one week (id `social_2027-01-03`) | `kind`, `week`, `posts` or `yt`, `by`, `at` |
| `projects` | A project such as the Stadtteilfest, a Serve Day or the BBQ | `name`, `date` (event), `leader` (person id), `leaderName` (if not on the team list), `sponsor` (who it reports to), `status` (`planning`, `running`, `done`, `reviewed`), `win`, `team` (`[{pid, name, resp}]`), `budget`, `alloc`, `reportState` (`ontrack`, `risk`, `help`), `reportText`, `reportAt`, `rvGood`, `rvLearn`, `rvGrew`, `copiedFrom`, `createdAt` |
| `spend` | One expense | `owner` (`dept:<person id>` or `prj:<project id>`), `what`, `amount` (euros), `date`, `by`, `at` |
| `requests` | A request from one department to another, e.g. Moses asks Hami for posts for a children's event | `from`, `to` (person ids), `text` (as written), `title`, `event`, `eventDate`, `audience`, `need`, `message`, `material`, `neededBy`, `late` (true if sent with less than 14 days' notice), `status` (`sent`, `proposed`, `accepted`, `clash`, `declined`, `done`), `proposedDate`, `plannedFor`, `reply` (reason for declining or the clash), `taskId`, `decidedBy` (the leader who settled a clash), `posts` (drafted Instagram posts), `sentOn`, `createdAt`, `doneAt` |
| `groups` | One Hey Fam leader (tab "Hey Fams") | `leader` (name), `name` (the Hey Fam), `owner` (person id of who does the monthly check-in, usually Michi), `checks` (`{"2026-11": {energy: 1–5, how, god: highlights, pray: challenges and prayer requests, date, by, at}}`), `createdAt`. Check-ins are visible only to staff and the owner. |

Budgets: only the department leader sees and manages their department's allocation and spending. The person they report to (or anyone above) sets the yearly amount and sees nothing more. A project's budget is shown only inside that project, to its team, the person it reports to and staff.

Privacy: `pulses`, `seen`, the growth fields in `people` and one-to-one meetings are visible only to the person and the people above them in `reports`. The server enforces this in `src/access.ts` (see docs/access.md).

Requests: the lead time is 14 days (`REQUEST_LEAD_DAYS`). A request with less notice can still be sent but is marked late. The receiver accepts (a task is created for them with `requestId`), proposes another date (the sender agrees or withdraws), declines with a reason, or marks it as a clash. Only a clash goes to the receiver's leader (`reports`), who decides: they take it (with a date) or not now (with a reason). Ticking the task sets the request to `done` and tells the sender.

Growth path (from 4 Jan 2027): five monthly stations along the five dimensions, each with the idol that pulls leaders away from God, a verse and the one question "Wie wachse ich in dieser Dimension?"; station = (months since Jan 2027) mod 5. The texts live in `STATIONS` and `COMMIT` in the dashboard. The weekly heart check and the quarterly commitment are visible to the person and everyone above them.

Language: the team works in German (default) and English. Texts written for everyone have a German twin field ending in `De` (people: name, role, summary, duties, wins, decision zones; rhythms: name, goal, agenda, who; projects: win). Show the twin when the user's language is German and it is filled. Mission: "Wir helfen Menschen, Jesus zu folgen." Wording: "Celebration" (never "Gottesdienst"), "prägen" for shaping people.

## Notifications

The dashboard writes these events to `notes`. The server (`src/notify.ts`) sends each one as a push message to every device of that person, and by Resend email if they have no device with push. Only the newest `NOTIFICATIONS_KEEP_PER_PERSON` are kept.

| `kind` | Sent to | When |
|---|---|---|
| `task` | The task's owner | Someone else gives them a task, directly, from a meeting, from the "I see in you" list or as a growth step |
| `done` | The owner's leader | A task is ticked off |
| `celebrated` | The owner | Their leader marks a finished task as celebrated |
| `budget` | The department leader | Their yearly budget is set or changed |
| `project` | The project leader, a new team member, or the person the project reports to | A project is created or handed to a new leader, someone is added to a project team, or a project's status is set to at risk or needs help |
| `request` | The receiver, the sender, or the receiver's leader on a clash | A request is sent, accepted, given another date, declined, withdrawn, finished, or clashes and is decided |
| `support` | The person's leader | The person writes or changes their support request in the growth questions |

## Scheduled jobs

| Job | When | Status |
|---|---|---|
| Morning push | `BRIEFING_DAILY_CRON` (Mon–Sat 7:30) | Built (`src/jobs.ts`): "N tasks today, M overdue" to everyone with push on |
| Richer morning briefing | same | To do: today's meetings, this Sunday's sermon and dimension, yesterday's completions by their team |
| Weekly summary for volunteer leaders | `BRIEFING_WEEKLY_CRON` | To do: open tasks, the week's questions, the memory verse |
| One-to-one reminder | in the morning briefing | To do: leaders whose direct report has had no one-to-one for `ONE_TO_ONE_DUE_DAYS` |
| Planning Center sync | `PCO_SYNC_CRON` | To do: people, holidays and serving plans into the database |
| Backup | nightly | Server cron with `pg_dump` (see README) |
