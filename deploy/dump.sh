#!/usr/bin/env bash
# Daily dump of the leads table.
#
# Losing the data in week three means losing the test, so this runs from cron
# rather than being something anyone has to remember — see /etc/cron.d/scopeguard.
#
# Whatever invokes it has to *export* DATABASE_URL. Plain `. .env` does not:
# it sets shell variables, and this script is a separate process that never
# sees them. Hence `set -a` around the source in the cron line.
#
# Nothing here deletes old dumps: every file is the whole table, so the only
# thing retention could buy is disk, and one gzipped CSV of a demand test costs
# less of it than the chance of throwing away the one readable copy. The
# tradeoff flips the day this directory actually grows — prune it by hand then.

set -euo pipefail

DUMP_DIR="${DUMP_DIR:-/srv/scopeguard/dumps}"

: "${DATABASE_URL:?set DATABASE_URL, e.g. by sourcing /srv/scopeguard/.env}"

mkdir -p "$DUMP_DIR"
stamp="$(date -u +%Y-%m-%d)"
out="$DUMP_DIR/leads_scopeguard_$stamp.csv.gz"

psql "$DATABASE_URL" -c "\copy (SELECT * FROM leads_scopeguard ORDER BY id) TO STDOUT WITH CSV HEADER" \
  | gzip > "$out"

echo "$(date -u +%FT%TZ) wrote $out ($(du -h "$out" | cut -f1))"
