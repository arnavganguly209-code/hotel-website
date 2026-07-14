#!/usr/bin/env bash
# Hostinger VPS deploy (run from /var/www/hotel-website after git reset --hard).
# - Does not touch .env
# - Does not delete public/uploads
# - Builds while the old process is still up, then reloads PM2
# - Restores previous .next if the build fails

set -euo pipefail

APP_NAME="hotel-thamel-park"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Working directory: $ROOT"

if [ -f .env ]; then
  echo "==> .env present (left untouched)"
else
  echo "ERROR: .env missing — aborting."
  exit 1
fi

mkdir -p public/uploads

echo "==> npm install"
npm install

# Keep serving the previous build during compile; restore on failure
if [ -d .next ]; then
  echo "==> Backing up current .next → .next.prev"
  rm -rf .next.prev
  cp -a .next .next.prev
fi

echo "==> npm run build"
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

echo "==> Recycling PM2 process ($APP_NAME) —update-env"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  # Prefer graceful reload (near-zero downtime). Fall back to restart if reload is unavailable.
  pm2 reload "$APP_NAME" --update-env || pm2 restart "$APP_NAME" --update-env
else
  echo "==> Process not found — starting from ecosystem.config.js as $APP_NAME"
  pm2 start ecosystem.config.js
fi

pm2 save
rm -rf .next.prev

echo "==> PM2 status"
pm2 list
echo "==> vps-deploy.sh complete"
