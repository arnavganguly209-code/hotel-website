#!/usr/bin/env bash
# ONE-TIME Hostinger bootstrap. After this, only GitHub Actions deploys.
# Usage: bash scripts/vps-bootstrap-once.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/hotel-website}"
REPO_URL="${REPO_URL:-https://github.com/arnavganguly209-code/hotel-website.git}"
APP_NAME="hotel-thamel-park"
BRANCH="${BRANCH:-main}"

echo "==> ONE-TIME bootstrap → $APP_DIR"

if [ ! -d "$APP_DIR/.git" ]; then
  sudo mkdir -p "$(dirname "$APP_DIR")"
  if [ -e "$APP_DIR" ] && [ ! -d "$APP_DIR/.git" ]; then
    echo "ERROR: $APP_DIR exists but is not a git repo. Move it aside, then re-run."
    exit 1
  fi
  sudo git clone "$REPO_URL" "$APP_DIR"
  sudo chown -R "$(whoami):$(whoami)" "$APP_DIR"
fi

cd "$APP_DIR"
git fetch origin
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

if [ ! -f .env ]; then
  echo "ERROR: Create $APP_DIR/.env first (DATABASE_URL, SITE_URL, secrets), then re-run."
  exit 1
fi

mkdir -p public/uploads logs
chmod +x scripts/vps-deploy.sh scripts/vps-bootstrap-once.sh || true

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
npm run build

if pm2 describe hotel-thamel-park-spa >/dev/null 2>&1; then
  pm2 delete hotel-thamel-park-spa || true
fi

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 reload "$APP_NAME" --update-env || pm2 restart "$APP_NAME" --update-env
else
  pm2 start ecosystem.config.js
fi

pm2 save
pm2 startup || true

echo "ONE-TIME BOOTSTRAP COMPLETE — use git push origin main only from now on."
pm2 status
curl -sS -o /dev/null -w "Health HTTP %{http_code}\n" "https://hotel.theglobalorbit.com" || true
