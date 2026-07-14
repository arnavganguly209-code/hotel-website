#!/usr/bin/env bash
# Hostinger VPS production deploy (called by GitHub Actions).
# Assumes code is already at origin/main in /var/www/hotel-website.
#
# Protects forever: .env | public/uploads | PostgreSQL
# Never runs: git clean | prisma migrate reset | DB drops

set -euo pipefail

APP_NAME="hotel-thamel-park"
SITE_URL="${SITE_URL:-https://hotel.theglobalorbit.com}"
HEALTH_URL="${HEALTH_URL:-$SITE_URL}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "Deployment Started"
echo "Latest Git Commit: $(git log -1 --pretty=format:'%h %s')"

# ── Protect secrets, uploads, database ───────────────────────
if [ ! -f .env ]; then
  echo "ERROR: .env missing — aborting (never create/overwrite .env from CI)."
  exit 1
fi
echo "Protected: .env present (untouched)"
mkdir -p public/uploads
echo "Protected: public/uploads (untouched)"
echo "Protected: database (no migrations that modify schema/data)"

# ── Install ──────────────────────────────────────────────────
echo "Installing packages"
if [ -f package-lock.json ]; then
  npm ci
else
  echo "WARN: package-lock.json missing — falling back to npm install"
  npm install
fi

# ── Build with rollback artifacts ────────────────────────────
if [ -d .next ]; then
  echo "Backing up previous build → .next.prev"
  rm -rf .next.prev
  cp -a .next .next.prev
fi

echo "Building project"
set +e
npm run build
BUILD_STATUS=$?
set -e

if [ "$BUILD_STATUS" -ne 0 ]; then
  echo "ERROR: Build failed — restoring previous working version"
  if [ -d .next.prev ]; then
    rm -rf .next
    mv .next.prev .next
  fi
  exit "$BUILD_STATUS"
fi

# ── PM2 ──────────────────────────────────────────────────────
echo "Reloading PM2"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 reload "$APP_NAME" --update-env || pm2 restart "$APP_NAME" --update-env
else
  echo "PM2 process missing — starting from ecosystem.config.js"
  pm2 start ecosystem.config.js
fi
pm2 save

# Give Next.js a moment to accept connections after reload
sleep 3

# ── Health check ─────────────────────────────────────────────
echo "Health Check → $HEALTH_URL"
set +e
HTTP_CODE="$(curl -sS -o /tmp/hotel-health-body.txt -w "%{http_code}" \
  --max-time 30 \
  -H "Cache-Control: no-cache" \
  "$HEALTH_URL" || echo "000")"
set -e

if [ "$HTTP_CODE" != "200" ]; then
  echo "ERROR: Health check failed (HTTP $HTTP_CODE) — rolling back build + PM2"
  if [ -d .next.prev ]; then
    rm -rf .next
    mv .next.prev .next
    if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
      pm2 reload "$APP_NAME" --update-env || pm2 restart "$APP_NAME" --update-env
    fi
  fi
  exit 1
fi

rm -rf .next.prev

echo "Deployment Successful"
echo "Current deployed commit: $(git rev-parse HEAD)"
echo "Current deployed commit (short): $(git log -1 --pretty=format:'%h %s')"
echo "Website URL: $SITE_URL"
echo "HTTP status: $HTTP_CODE"
pm2 status
echo "Website updated automatically — no manual VPS steps required."
