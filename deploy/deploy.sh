#!/usr/bin/env bash
# One deploy, run on the server as the `scopeguard` user.
#
# GitHub Actions calls this over SSH with the commit it just pushed
# (`deploy/deploy.sh <sha>`), but nothing here needs CI: the same line run by
# hand does the same thing, which is the point — a deploy you cannot perform
# without GitHub is a deploy you cannot perform when GitHub is down.
#
# CI runs the copy of this script already on disk, which then checks out the new
# commit — so an edit to this file lands one deploy late. That is the price of
# the script owning the checkout, and the checkout is what makes the rollback
# below mean anything: fetch first in CI and `previous` would already be the new
# commit, leaving a rollback that rolls back to itself. When a change here has
# to take effect immediately, run it by hand once after the push.
#
# It ends with a health check, and if the new revision fails it puts the old one
# back. That is worth stating plainly: the rollback restores the *code*, not the
# database. Migrations here only add tables, columns and indexes (`sql/*.sql`,
# all `IF NOT EXISTS`), so the previous revision keeps running against a
# slightly newer schema and does not notice. The day a migration drops or
# renames something, this script stops being a safe rollback and the change
# needs its own plan.

set -euo pipefail

APP_DIR="${APP_DIR:-/srv/scopeguard}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/healthz}"
HEALTH_TRIES="${HEALTH_TRIES:-20}"

cd "$APP_DIR"

target="${1:-origin/main}"

log() { echo "$(date -u +%FT%TZ) $*"; }

# Wait rather than probe once: the process has to open a pool and answer
# `SELECT 1` before it is up, and a check that fires too early reports a
# healthy deploy as broken.
health() {
  for _ in $(seq "$HEALTH_TRIES"); do
    if curl -fsS --max-time 3 "$HEALTH_URL" >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  return 1
}

install_revision() {
  # `reset --hard` and never `clean`: this directory is also the deploy user's
  # home, and `.ssh/authorized_keys`, `.env` and `dumps/` all live in it
  # untracked. A tidy-up here would lock the next deploy out of the server.
  git reset --hard --quiet "$1"
  npm ci --omit=dev --no-audit --no-fund
  npm run migrate
  sudo -n systemctl restart scopeguard
}

previous="$(git rev-parse HEAD)"
git fetch --quiet origin
requested="$(git rev-parse --verify "$target^{commit}")"

if [ "$requested" = "$previous" ]; then
  log "already at $previous — re-running anyway (deps or .env may have changed)"
fi

log "deploying $requested (was $previous)"
install_revision "$requested"

if health; then
  log "healthy at $(git rev-parse --short HEAD)"
  exit 0
fi

log "health check failed — rolling back to $previous"
install_revision "$previous"

if health; then
  log "rolled back, serving $previous"
else
  # Both revisions are down, so this is no longer about which commit is
  # deployed. Say so instead of exiting quietly with the same code as a
  # successful rollback.
  log "ROLLBACK ALSO UNHEALTHY — the service is down, check: journalctl -u scopeguard -n 50"
fi
exit 1
