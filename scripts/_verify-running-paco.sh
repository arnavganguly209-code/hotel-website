#!/usr/bin/env bash
set -euo pipefail
cd /var/www/hotel-website
PID="$(pm2 pid hotel-thamel-park | tr -d '[:space:]')"
echo "pid=$PID"
echo "pm2_status=$(pm2 jlist | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const a=JSON.parse(s).find(x=>x.name==="hotel-thamel-park");console.log(a?a.pm2_env.status:"missing")})')"
echo "=== running process nonsecret ==="
tr '\0' '\n' < "/proc/$PID/environ" | grep -E '^HBL_PACO_(ENV|OFFICE_ID|BASE_URL|ENCRYPTION_KEY_ID|REQUEST_3DS|CURRENCY|SDK_DEMO_SHAPE)=' || true
echo "=== .env nonsecret ==="
grep -E '^HBL_PACO_(ENV|OFFICE_ID|BASE_URL|ENCRYPTION_KEY_ID|REQUEST_3DS|CURRENCY|SDK_DEMO_SHAPE)=' .env || true
echo "=== http ==="
curl -sS -o /dev/null -w "http_status=%{http_code}\n" --max-time 20 https://hotelthamelpark.com/
echo "=== recent error log after 07:05 ==="
awk '$0 ~ /2026-08-11T07:/ || $0 ~ /2026-08-11T08:/ || $0 ~ /2026-08-11T09:/' /root/.pm2/logs/hotel-thamel-park-error-47.log | sed -E 's/(HBL_PACO_API_KEY|BEGIN (RSA )?PRIVATE KEY|CompanyApiKey)[^ ]*/[redacted]/g' | tail -20 || true
echo "=== recent out log after 07:05 ==="
awk '$0 ~ /2026-08-11T07:/' /root/.pm2/logs/hotel-thamel-park-out-47.log | sed -E 's/(HBL_PACO_API_KEY|BEGIN (RSA )?PRIVATE KEY|CompanyApiKey)[^ ]*/[redacted]/g' | tail -30 || true
echo DONE
