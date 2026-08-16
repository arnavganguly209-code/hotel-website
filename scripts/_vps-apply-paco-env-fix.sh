#!/usr/bin/env bash
# Apply PACO .env into the running PM2 process. Never prints secrets.
set -euo pipefail
exec 9>/tmp/htp-prod-deploy.lock
flock 9
cd /var/www/hotel-website
set +e
. /var/www/hotel-website/scripts/vps-env.sh
set -e
node scripts/pm2-reload-from-dotenv.mjs
sleep 8
echo "=== PM2 status ==="
pm2 describe hotel-thamel-park | head -20
echo "=== HTTP ==="
curl -sS -o /dev/null -w "http_status=%{http_code}\n" --max-time 20 https://hotelthamelpark.com/
echo "=== startup logs (redacted) ==="
pm2 logs hotel-thamel-park --lines 40 --nostream 2>/dev/null | sed -E 's/(HBL_PACO_API_KEY|BEGIN (RSA )?PRIVATE KEY|CompanyApiKey)[^ ]*/[redacted]/g' || true
echo "=== DONE ==="
