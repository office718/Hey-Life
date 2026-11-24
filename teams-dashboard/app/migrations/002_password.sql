-- Sign-in is a login id plus a password. Email stays for notifications.
alter table users add column login text;
alter table users add column password_hash text;
update users set login = lower(email) where login is null;
alter table users alter column login set not null;
create unique index users_login_unique on users (login);
