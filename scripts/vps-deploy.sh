#!/usr/bin/env bash
# Hostinger VPS production deploy (GitHub Actions → /var/www/hotel-website)
# Protects: public/uploads (never delete) | cut over DATABASE_URL to localhost thamelpark

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
command -v git && git --version || echo "git MISSING"
command -v node && node -v || echo "node MISSING"
command -v npm && npm -v || echo "npm MISSING"
command -v pm2 && pm2 -v || echo "pm2 MISSING"
command -v npx && npx -v || echo "npx MISSING"
echo "git rev-parse HEAD: $(git rev-parse HEAD 2>/dev/null || true)"
echo "EXPECTED_SHA: ${EXPECTED_SHA:-not provided}"
echo "============================================"

# shellcheck disable=SC1091
. "$ROOT/scripts/vps-env.sh"

echo "Deployment Started"
echo "Latest Git Commit: $(git log -1 --pretty=format:'%h %s')"

if [ ! -f .env ]; then
  echo "ERROR: .env missing — aborting."
  exit 1
fi

# Preserve existing uploads — mkdir -p never deletes files
mkdir -p public/uploads
chmod -R ug+rwX public/uploads || true
if [ -z "${UPLOADS_ROOT:-}" ]; then
  export UPLOADS_ROOT="$ROOT/public/uploads"
fi
echo "UPLOADS_ROOT=$UPLOADS_ROOT (preserved)"

echo "Installing packages (npm ci)"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

# Final cutover: hosted DB abandoned → localhost thamelpark
set +e
bash scripts/cutover-to-thamelpark.sh > /tmp/htp-cutover.log 2>&1
CUTOVER_RC=$?
set -e
tail -n 100 /tmp/htp-cutover.log || true
cp -f /tmp/htp-cutover.log public/__cutover-log.txt 2>/dev/null || true
if [ "$CUTOVER_RC" -ne 0 ]; then
  echo "ERROR: cutover-to-thamelpark.sh exited $CUTOVER_RC"
  exit 1
fi

# Fail deploy if Neon still present
if grep -Eqi '^DATABASE_URL=.*neon\.tech' .env; then
  echo "ERROR: DATABASE_URL still points at neon.tech"
  exit 1
fi
if ! grep -Eqi '^DATABASE_URL=.*(127\.0\.0\.1|localhost).*/thamelpark' .env; then
  echo "ERROR: DATABASE_URL must be localhost thamelpark"
  exit 1
fi
echo "OK: DATABASE_URL uses local PostgreSQL thamelpark"

# shellcheck disable=SC1091
set -a
# Export DATABASE_URL for subsequent prisma/build without printing secrets
DATABASE_URL="$(grep -E '^DATABASE_URL=' .env | tail -1 | sed 's/^DATABASE_URL=//')"
export DATABASE_URL
set +a

npx prisma generate
set +e
npx prisma migrate deploy
set -e

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
  pm2 start ecosystem.config.js
fi
pm2 save

echo "Waiting 10 seconds before health check..."
sleep 10

echo "Health Check → $HEALTH_URL"
set +e
HTTP_CODE="$(curl -sS -o /tmp/hotel-health-body.txt -w "%{http_code}" \
  --max-time 45 \
  -H "Cache-Control: no-cache" \
  "$HEALTH_URL" || echo "000")"
set -e

if [ "$HTTP_CODE" != "200" ]; then
  echo "ERROR: Health check failed (HTTP $HTTP_CODE) — rolling back build"
  if [ -d .next.prev ]; then
    rm -rf .next
    mv .next.prev .next
    pm2 reload "$APP_NAME" --update-env || pm2 restart "$APP_NAME" --update-env || true
  fi
  exit 1
fi

DEPLOYED_SHA="$(git rev-parse HEAD)"
if [ -n "$EXPECTED_SHA" ] && [ "$DEPLOYED_SHA" != "$EXPECTED_SHA" ]; then
  echo "WARN: HEAD $DEPLOYED_SHA != GITHUB_SHA $EXPECTED_SHA (continuing)"
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
if [ "$PROBE_CODE" != "200" ] || [ "$PROBE_BODY" != "HTP-UPLOAD-OK" ]; then
  echo "ERROR: Runtime /uploads route failed"
  rm -f "$PROBE_PATH" || true
  exit 1
fi
rm -f "$PROBE_PATH" || true
echo "Uploads runtime probe OK"

rm -rf .next.prev

echo "Deployment Successful"
echo "Commit: $DEPLOYED_SHA"
echo "URL: $SITE_URL HTTP $HTTP_CODE"
pm2 status
