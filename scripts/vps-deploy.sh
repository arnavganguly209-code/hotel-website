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
echo "Protected: .env (untouched)"
mkdir -p public/uploads
echo "Protected: public/uploads (untouched)"
echo "Protected: database (untouched)"

echo "Installing packages (npm ci)"
if [ -f package-lock.json ]; then
  npm ci
else
  echo "WARN: package-lock.json missing — npm install"
  npm install
fi

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
  echo "ERROR: Deployed commit $DEPLOYED_SHA != GitHub SHA $EXPECTED_SHA"
  exit 1
fi

rm -rf .next.prev

echo "Deployment Successful"
echo "Current deployed commit: $DEPLOYED_SHA"
echo "Current deployed commit (short): $(git log -1 --pretty=format:'%h %s')"
echo "Website URL: $SITE_URL"
echo "HTTP status: $HTTP_CODE"
pm2 status
echo "Website updated automatically — no manual VPS steps required."
