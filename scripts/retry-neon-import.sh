#!/usr/bin/env bash
# Retry Neon → localhost import when transfer quota is restored.
# Looks for saved Neon URL under /var/backups/hotel-thamel-park/neon-url-*.secret
# Usage (on VPS): bash scripts/retry-neon-import.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/hotel-thamel-park}"
mkdir -p "$BACKUP_DIR"

get_env() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" .env | tail -1 || true)"
  [ -z "$line" ] && { echo ""; return 0; }
  echo "${line#*=}" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//'"
}

CURRENT_URL="$(get_env DATABASE_URL)"
if ! echo "$CURRENT_URL" | grep -Eqi '(localhost|127\.0\.0\.1)'; then
  echo "ERROR: current DATABASE_URL is not localhost — aborting retry import"
  exit 1
fi

NEON_URL="${NEON_SOURCE_URL:-}"
if [ -z "$NEON_URL" ]; then
  LATEST_SECRET="$(ls -1t "$BACKUP_DIR"/neon-url-*.secret 2>/dev/null | head -1 || true)"
  if [ -n "$LATEST_SECRET" ]; then
    NEON_URL="$(cat "$LATEST_SECRET")"
    echo "Using saved Neon URL from $LATEST_SECRET"
  fi
fi

if [ -z "$NEON_URL" ] || ! echo "$NEON_URL" | grep -Eqi 'neon\.tech'; then
  echo "ERROR: No Neon source URL. Set NEON_SOURCE_URL or place neon-url-*.secret in $BACKUP_DIR"
  exit 1
fi

echo "Testing Neon connectivity…"
if ! PGSSLMODE=require psql "$NEON_URL" -c 'SELECT 1' >/dev/null 2>&1; then
  echo "ERROR: Neon still unreachable (quota or auth). Try again after Neon restores access."
  exit 1
fi

# Temporarily point migrate script at Neon by rewriting .env, run migrate, done.
# Safer: dump Neon then restore into current localhost DB.
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DUMP_CUSTOM="$BACKUP_DIR/neon-retry-${STAMP}.dump"

echo "Dumping Neon → $DUMP_CUSTOM"
PGSSLMODE=require pg_dump "$NEON_URL" --no-owner --no-acl --format=custom --file="$DUMP_CUSTOM"

echo "Restoring into current localhost DATABASE_URL"
export PGPASSWORD
# Extract password from CURRENT_URL for pg_restore if needed — use full URL
set +e
pg_restore --clean --if-exists --no-owner --no-acl --dbname="$CURRENT_URL" "$DUMP_CUSTOM"
RESTORE_STATUS=$?
set -e
if [ "$RESTORE_STATUS" -ne 0 ]; then
  echo "WARN: pg_restore exited $RESTORE_STATUS (often OK with --clean warnings). Verifying…"
fi

CONTENT_ROWS="$(psql "$CURRENT_URL" -tAc 'SELECT COUNT(*) FROM "SiteContentRecord";' | tr -d '[:space:]')"
if [ -z "$CONTENT_ROWS" ] || [ "$CONTENT_ROWS" = "0" ]; then
  echo "ERROR: SiteContentRecord empty after retry import"
  exit 1
fi

echo "OK: retry import complete. SiteContentRecord rows=$CONTENT_ROWS"
echo "Reload PM2: pm2 reload hotel-thamel-park --update-env"
