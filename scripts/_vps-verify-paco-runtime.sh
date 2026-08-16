#!/usr/bin/env bash
# READ-ONLY: Production PACO identifiers + recent diagnostic logs. Never prints secrets.
set -euo pipefail
cd /var/www/hotel-website
echo "HEAD=$(git rev-parse HEAD)"
echo "HEAD_SHORT=$(git rev-parse --short HEAD)"
test -f lib/payments/paco/http-error.ts && echo "http-error.ts=present"
PID="$(pm2 pid hotel-thamel-park 2>/dev/null | tr -d '[:space:]')"
echo "PID=$PID"
pm2 jlist | node -e '
const fs=require("fs");
const apps=JSON.parse(fs.readFileSync(0,"utf8"));
const a=apps.find(x=>x.name==="hotel-thamel-park");
if(!a){console.log("pm2_status=missing"); process.exit(0);}
const e=a.pm2_env||{};
console.log("pm2_status="+e.status);
console.log("pm2_pid="+a.pid);
const keys=["HBL_PACO_ENV","HBL_PACO_OFFICE_ID","HBL_PACO_BASE_URL","HBL_PACO_ENCRYPTION_KEY_ID","HBL_PACO_REQUEST_3DS","HBL_PACO_CURRENCY","HBL_PACO_SDK_DEMO_SHAPE"];
for (const k of keys) {
  const v=e[k];
  console.log("pm2."+k+"="+(v!=null && String(v).trim() ? String(v) : "(unset)"));
}
console.log("pm2.has_API_KEY="+Boolean(String(e.HBL_PACO_API_KEY||"").trim()));
console.log("pm2.has_SIGNING="+Boolean(String(e.HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY||"").trim()));
console.log("pm2.has_DECRYPT="+Boolean(String(e.HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY||"").trim()));
'
if [ -n "$PID" ] && [ -r "/proc/$PID/environ" ]; then
  echo "=== /proc environ nonsecret ==="
  tr '\0' '\n' < "/proc/$PID/environ" | grep -E '^HBL_PACO_(ENV|OFFICE_ID|BASE_URL|ENCRYPTION_KEY_ID|REQUEST_3DS|CURRENCY|SDK_DEMO_SHAPE)=' || true
fi
echo "=== instrumentation (redacted) ==="
grep -h "HBL PACO runtime" /root/.pm2/logs/hotel-thamel-park-out-47.log /root/.pm2/logs/hotel-thamel-park-error-47.log 2>/dev/null | tail -3 || true
curl -sS -o /dev/null -w "http_status=%{http_code}\n" --max-time 20 https://hotelthamelpark.com/
echo VERIFY_OK
