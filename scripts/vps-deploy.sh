#!/usr/bin/env bash
# Hostinger VPS production deploy (GitHub Actions → /var/www/hotel-website)
# Protects: .env | public/uploads | PostgreSQL

set -euxo pipefail

APP_NAME="hotel-thamel-park"
SITE_URL="${SITE_URL:-https://hotel.theglobalorbit.com}"
HEALTH_URL="${HEALTH_URL:-$SITE_URL}"
EXPECTED_SHA="${GITHUB_SHA:-}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "========== PRE-DEPLOY DIAGNOSTICS =========="
pwd
whoami
echo "HOME=$HOME"
echo "PATH=$PATH"
echo "which bash: $(command -v bash || true)"
echo "which sh: $(command -v sh || true)"
command -v git && git --version || echo "git MISSING"
command -v node && node -v || echo "node MISSING"
command -v npm && npm -v || echo "npm MISSING"
command -v pm2 && pm2 -v || echo "pm2 MISSING"
command -v npx && npx -v || echo "npx MISSING"
command -v curl && curl --version | head -1 || echo "curl MISSING"
echo "git remote -v:"
git remote -v || true
echo "git branch: $(git branch --show-current 2>/dev/null || true)"
echo "git rev-parse HEAD: $(git rev-parse HEAD 2>/dev/null || true)"
echo "EXPECTED_SHA (GitHub): ${EXPECTED_SHA:-not provided}"
echo "============================================"

# shellcheck disable=SC1091
. "$ROOT/scripts/vps-env.sh"

echo "Deployment Started"
echo "Latest Git Commit: $(git log -1 --pretty=format:'%h %s')"

if [ ! -f .env ]; then
  echo "ERROR: .env missing — aborting."
  exit 1
fi
echo "Protected: .env (will only update DATABASE_URL during Neon→localhost migration)"

write_db_status() {
  mkdir -p public
  local STATUS_MSG="$1"
  local STATUS_HOST
  STATUS_HOST="$(grep -E '^DATABASE_URL=' .env 2>/dev/null | sed -E 's/.*@([^/:?]+).*/\1/' | head -1 || echo unknown)"
  local IS_NEON=false
  echo "$STATUS_HOST" | grep -qi 'neon\.tech' && IS_NEON=true || true
  printf '{"updatedAt":"%s","message":"%s","databaseHost":"%s","isNeon":%s,"commit":"%s"}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    "$(printf '%s' "$STATUS_MSG" | tr '"\\' '  ')" \
    "$(printf '%s' "$STATUS_HOST" | tr '"\\' '  ')" \
    "$IS_NEON" \
    "$(git rev-parse --short HEAD 2>/dev/null || echo unknown)" \
    > public/__db-migrate-status.json
  echo "Wrote public/__db-migrate-status.json → $STATUS_MSG (host=$STATUS_HOST neon=$IS_NEON)"
}

write_db_status "deploy-started"

echo "Installing packages before DB migration (npm ci)"
if [ -f package-lock.json ]; then
  npm ci
else
  echo "WARN: package-lock.json missing — npm install"
  npm install
fi

# Auto-migrate off Neon if still configured (one-time, idempotent).
if grep -Eqi '^DATABASE_URL=.*neon\.tech' .env; then
  echo "DETECTED Neon DATABASE_URL — migrating to VPS localhost PostgreSQL"
  write_db_status "neon-detected-starting-migration"
  chmod +x scripts/migrate-neon-to-localhost.sh scripts/retry-neon-import.sh || true
  # Ensure server + client tools exist
  if ! command -v pg_dump >/dev/null 2>&1 || ! command -v psql >/dev/null 2>&1; then
    echo "Installing postgresql / postgresql-client…"
    export DEBIAN_FRONTEND=noninteractive
    if command -v sudo >/dev/null 2>&1; then
      sudo -n apt-get update -y || sudo apt-get update -y
      sudo -n apt-get install -y postgresql postgresql-contrib postgresql-client \
        || sudo apt-get install -y postgresql postgresql-contrib postgresql-client
      sudo -n systemctl enable --now postgresql 2>/dev/null \
        || sudo systemctl enable --now postgresql 2>/dev/null \
        || sudo service postgresql start || true
    else
      apt-get update -y
      apt-get install -y postgresql postgresql-contrib postgresql-client
      systemctl enable --now postgresql || service postgresql start || true
    fi
  fi
  if command -v sudo >/dev/null 2>&1; then
    sudo -n systemctl start postgresql 2>/dev/null || sudo systemctl start postgresql 2>/dev/null || sudo service postgresql start || true
  else
    systemctl start postgresql 2>/dev/null || service postgresql start || true
  fi

  set +e
  export ALLOW_CMS_SEED_FALLBACK=1
  bash scripts/migrate-neon-to-localhost.sh > /tmp/htp-migrate.log 2>&1
  MIGRATE_RC=$?
  set -e
  tail -n 80 /tmp/htp-migrate.log || true
  cp -f /tmp/htp-migrate.log public/__db-migrate-log.txt 2>/dev/null || true

  if [ "$MIGRATE_RC" -ne 0 ]; then
    write_db_status "migration-script-failed-rc-$MIGRATE_RC"
    echo "ERROR: migrate-neon-to-localhost.sh exited $MIGRATE_RC"
    exit 1
  fi

  # Apply any pending Prisma migrations against localhost
  npx prisma migrate deploy || npx prisma db push --accept-data-loss=false || true
  npx prisma generate
  write_db_status "migration-finished"
else
  echo "DATABASE_URL is not Neon — skip DB migration"
  write_db_status "skip-not-neon"
fi

# Fail deploy if Neon still present after migration attempt
if grep -Eqi '^DATABASE_URL=.*neon\.tech' .env; then
  write_db_status "abort-still-neon-after-migration"
  echo "ERROR: DATABASE_URL still points at neon.tech after migration"
  exit 1
fi
if ! grep -Eqi '^DATABASE_URL=.*(127\.0\.0\.1|localhost)' .env; then
  write_db_status "abort-not-localhost"
  echo "ERROR: DATABASE_URL must use localhost / 127.0.0.1 on this VPS"
  exit 1
fi
echo "OK: DATABASE_URL uses local PostgreSQL"
write_db_status "ok-localhost"

mkdir -p public/uploads/{culture,gallery,rooms,dining,spa,logo,payments,hero,seo,general}
chmod -R ug+rwX public/uploads || true
echo "Protected: public/uploads (untouched; writable for Orbit)"
echo "Protected: database (local PostgreSQL)"
# Ensure Next can serve runtime uploads via app/uploads/[...path]
if [ -z "${UPLOADS_ROOT:-}" ]; then
  export UPLOADS_ROOT="$ROOT/public/uploads"
fi
echo "UPLOADS_ROOT=$UPLOADS_ROOT"

echo "Packages already installed before DB migration"

echo "Applying idempotent rooms booking schema update"
set +e
npx prisma db execute --file prisma/migrations/20260719230000_rooms_booking_flow/migration.sql
set -e

if [ -d .next ]; then
  echo "Backing up previous build → .next.prev"
  rm -rf .next.prev
  cp -a .next .next.prev
fi

echo "Building project (npm run build)"
set +e
npm run build
BUILD_STATUS=$?
set -e

if [ "$BUILD_STATUS" -ne 0 ]; then
  echo "ERROR: Build failed — restoring previous .next"
  if [ -d .next.prev ]; then
    rm -rf .next
    mv .next.prev .next
  fi
  exit "$BUILD_STATUS"
fi

echo "Reloading PM2 ($APP_NAME)"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 reload "$APP_NAME" --update-env || pm2 restart "$APP_NAME" --update-env
else
  if pm2 describe hotel-thamel-park-spa >/dev/null 2>&1; then
    pm2 delete hotel-thamel-park-spa || true
  fi
  echo "PM2 process missing — pm2 start ecosystem.config.js"
  pm2 start ecosystem.config.js
fi
pm2 save

echo "Waiting 5 seconds before health check..."
sleep 5

echo "Health Check → $HEALTH_URL"
set +e
curl -I "$HEALTH_URL" || true
HTTP_CODE="$(curl -sS -o /tmp/hotel-health-body.txt -w "%{http_code}" \
  --max-time 30 \
  -H "Cache-Control: no-cache" \
  "$HEALTH_URL" || echo "000")"
set -e

if [ "$HTTP_CODE" != "200" ]; then
  echo "ERROR: Health check failed (HTTP $HTTP_CODE) — rolling back"
  if [ -d .next.prev ]; then
    rm -rf .next
    mv .next.prev .next
    pm2 reload "$APP_NAME" --update-env || pm2 restart "$APP_NAME" --update-env || true
  fi
  exit 1
fi

DEPLOYED_SHA="$(git rev-parse HEAD)"
if [ -n "$EXPECTED_SHA" ] && [ "$DEPLOYED_SHA" != "$EXPECTED_SHA" ]; then
  echo "WARN: Deployed commit $DEPLOYED_SHA != GitHub SHA $EXPECTED_SHA (continuing)"
fi

echo "========== UPLOADS RUNTIME PROBE =========="
PROBE_DIR="$ROOT/public/uploads/general"
mkdir -p "$PROBE_DIR"
PROBE_NAME="deploy-probe-${DEPLOYED_SHA:0:8}.bin"
PROBE_PATH="$PROBE_DIR/$PROBE_NAME"
printf 'HTP-UPLOAD-OK' > "$PROBE_PATH"
chmod ug+rw "$PROBE_PATH" || true
PROBE_URL="$SITE_URL/uploads/general/$PROBE_NAME"
set +e
PROBE_CODE="$(curl -sS -o /tmp/hotel-upload-probe-body.bin -w "%{http_code}" \
  --max-time 20 \
  -H "Cache-Control: no-cache" \
  "$PROBE_URL" || echo "000")"
PROBE_BODY="$(cat /tmp/hotel-upload-probe-body.bin 2>/dev/null || true)"
set -e
echo "Probe URL: $PROBE_URL"
echo "Probe HTTP: $PROBE_CODE"
echo "Probe body: $PROBE_BODY"
if [ "$PROBE_CODE" != "200" ] || [ "$PROBE_BODY" != "HTP-UPLOAD-OK" ]; then
  echo "ERROR: Runtime /uploads route failed — Orbit uploads will 404"
  rm -f "$PROBE_PATH" || true
  exit 1
fi
rm -f "$PROBE_PATH" || true
echo "Uploads runtime probe OK"
echo "=========================================="

rm -rf .next.prev

echo "Deployment Successful"
echo "Current deployed commit: $DEPLOYED_SHA"
echo "Current deployed commit (short): $(git log -1 --pretty=format:'%h %s')"
echo "Website URL: $SITE_URL"
echo "HTTP status: $HTTP_CODE"
pm2 status
echo "Website updated automatically — no manual VPS steps required."
