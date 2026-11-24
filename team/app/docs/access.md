# Who sees and changes what

Code: `src/access.ts`. Tests: `test/access.test.ts`. Every change to these rules needs a test.

A login (`users`) is linked to one record in `people` (`person_id`). "Above" means: somewhere higher in the `reports` chain (Goddy reports to Michi, Michi to Victor: Victor and Michi are above Goddy).

## Roles

| Role | For | Sees | Changes |
|---|---|---|---|
| `admin` | Victor, Michi | everything | everything, plus logins (`/api/admin/users`) and may switch to any person's view |
| `staff` | Lead Team, Moses | everything | everything |
| `leader` | department and volunteer leaders (Goddy, Andinia, Tai, Hami, Mona, Tracy, …) | see below | see below |

Leaders always see only their own view (no "You are …" switch).

## What a leader sees

| Collection | Rule |
|---|---|
| people | everyone, but the private growth fields (identity answers, goal, why, strategy, support, rhythm, focus, priorities, budget allocation) only for themselves and the people below them |
| tasks | all, except tasks in area `Growth` of people not below them |
| meetings | team meetings, except the Lead Team; one-to-ones only their own and those of people below them |
| pulses (rhythm check) | own and below |
| seen ("I see in you") | nothing (Lead Team only) |
| notes | only their own notifications |
| spend | their own department, and projects they lead, sponsor or are part of |
| everything else | all |

## What a leader may change

| Collection | Rule |
|---|---|
| tasks | create any; change or delete tasks of their own, of people below them, or without owner |
| people | own record (not name, role, reports, order, budget, studio); records of people below them |
| meetings | create team meetings (not Lead Team); change one-to-ones of themselves or people below |
| requests | send in their own name; change requests they sent or received, or that clash below them |
| pulses | only their own |
| notes | create any (the dashboard sends notifications); delete their own |
| content | only with a studio or as approver (Tracy, Hami) |
| spend | own department and own projects |
| projects | update if they lead or sponsor it |
| weeks, metrics, rhythms, seen, stops, groups | no (staff only) |
