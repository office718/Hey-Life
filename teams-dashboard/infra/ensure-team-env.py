#!/usr/bin/env python3
"""Fill missing team-dashboard settings on the server. Does not print secret values.

The first argument is the heychurch code/infra directory. TEAM_* stay in that
.env, and team-site.caddy is written there because Caddy bind-mounts that file.
The Postgres data directory is not changed.

Writes the keys Compose requires, creates the import directory, and writes
team-site.caddy. The Caddy site is published only when the hostname resolves,
so a missing DNS record cannot stall certificates for the rest of the sites.
"""
import re
import secrets
import socket
import sys
from pathlib import Path

infra = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parent
env_path = infra / ".env"
example_path = infra / ".env.example"
site_path = infra / "team-site.caddy"
HOST_RE = re.compile(r"[A-Za-z0-9.-]+")


def parse(text: str) -> dict[str, str]:
    vals: dict[str, str] = {}
    for line in text.splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        vals[key] = value.strip().strip('"').strip("'")
    return vals


def blank(vals: dict[str, str], key: str) -> bool:
    return vals.get(key, "") == ""


if not env_path.exists():
    sys.exit(f"missing {env_path}")

env_text = env_path.read_text()
vals = parse(env_text)
example = parse(example_path.read_text()) if example_path.exists() else {}
extra: list[str] = []


def add(key: str, value: str) -> None:
    extra.append(f"{key}={value}")
    vals[key] = value


if blank(vals, "TEAM_DOMAIN"):
    add("TEAM_DOMAIN", "team.heylifeapp.de")
if blank(vals, "TEAM_APP_URL"):
    add("TEAM_APP_URL", "https://team.heylifeapp.de")
if blank(vals, "TEAM_POSTGRES_PASSWORD") and blank(vals, "TEAM_DATABASE_URL"):
    password = secrets.token_urlsafe(32)
    add("TEAM_POSTGRES_PASSWORD", password)
    add("TEAM_DATABASE_URL", f"postgres://hey:{password}@team-db:5432/hey")
elif blank(vals, "TEAM_POSTGRES_PASSWORD") or blank(vals, "TEAM_DATABASE_URL"):
    sys.exit("team database env is incomplete: set both TEAM_POSTGRES_PASSWORD and TEAM_DATABASE_URL")
if blank(vals, "TEAM_DATA_DIR"):
    data_dir = vals.get("DATA_DIR", "")
    if not data_dir:
        sys.exit("DATA_DIR is missing, so TEAM_DATA_DIR cannot be chosen")
    dest = data_dir.rstrip("/") + "/team-import"
    add("TEAM_DATA_DIR", dest)
if blank(vals, "TEAM_SENTRY_DSN") and example.get("TEAM_SENTRY_DSN"):
    add("TEAM_SENTRY_DSN", example["TEAM_SENTRY_DSN"])

if extra:
    suffix = "\n" if env_text.endswith("\n") or env_text == "" else "\n"
    env_path.write_text(env_text + suffix + "\n".join(extra) + "\n")
    print(f"team env: added {len(extra)} keys")
else:
    print("team env: already set")

import_dir = Path(vals["TEAM_DATA_DIR"])
import_dir.mkdir(parents=True, exist_ok=True)

host = vals["TEAM_DOMAIN"]
if not HOST_RE.fullmatch(host):
    sys.exit("TEAM_DOMAIN is not a hostname")
try:
    socket.getaddrinfo(host, 443)
    dns_ok = True
except socket.gaierror:
    dns_ok = False

if dns_ok:
    site_path.write_text(
        f"""{host} {{
	encode zstd gzip
	reverse_proxy heychurch-team:3000 {{
		flush_interval -1
	}}
	header -Server
}}
"""
    )
    print(f"team site enabled for {host}")
else:
    site_path.write_text(f"# {host} does not resolve yet. Re-run Deploy after the CNAME exists.\n")
    print(f"team site waiting for DNS: {host}")
