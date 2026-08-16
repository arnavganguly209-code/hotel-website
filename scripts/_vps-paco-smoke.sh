#!/usr/bin/env bash
set -euo pipefail
cd /var/www/hotel-website
echo "HEAD=$(git rev-parse HEAD)"
echo "HEAD_MSG=$(git log -1 --pretty=format:%s)"
pm2 describe hotel-thamel-park | sed -n '1,18p'
node scripts/verify-paco-runtime-config.mjs .env --require-production
curl -sS -o /dev/null -w "http_status=%{http_code}\n" --max-time 20 https://hotelthamelpark.com/
echo "recent_err_today:"
pm2 logs hotel-thamel-park --err --lines 5 --nostream --timestamp 2>/dev/null | tail -5 || true
echo "recent_out_today:"
pm2 logs hotel-thamel-park --out --lines 8 --nostream --timestamp 2>/dev/null | tail -8 || true
