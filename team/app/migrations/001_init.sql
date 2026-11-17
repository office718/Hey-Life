-- Every record of the dashboard is one JSON document in a named collection,
-- exactly like the Claude version (people, tasks, meetings, ...). See docs/data-model.md.
create table documents (
  collection text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by integer,
  primary key (collection, id)
);
create index documents_tasks_owner on documents ((data->>'owner')) where collection = 'tasks';
create index documents_notes_to on documents ((data->>'to')) where collection = 'notes';

-- Who may log in. person_id links the login to a record in the "people" collection.
-- role: admin (Lead Pastor, Pastor of Operations: everything incl. users),
--       staff (Lead Team and staff: read and write everything),
--       leader (department and volunteer leaders: their own area, see docs/access.md)
create table users (
  id serial primary key,
  email text not null unique,
  person_id text,
  role text not null default 'leader' check (role in ('admin', 'staff', 'leader')),
  lang text not null default 'de' check (lang in ('de', 'en')),
  disabled boolean not null default false,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table login_tokens (
  token_hash text primary key,
  user_id integer not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz
);

create table sessions (
  id_hash text primary key,
  user_id integer not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index sessions_user on sessions (user_id);

create table push_subscriptions (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
