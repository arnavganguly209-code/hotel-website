#!/usr/bin/env bash
# Apply HBL PACO env on Hostinger VPS (/var/www/hotel-website).
# Values are read from the environment. Does not print secret values.
# Production is fail-closed: UAT MID/endpoint/kid are rejected.

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/hotel-website}"
ENV_FILE="$APP_DIR/.env"

required_vars=(
  HBL_PACO_ENV
  HBL_PACO_OFFICE_ID
  HBL_PACO_API_KEY
  HBL_PACO_ENCRYPTION_KEY_ID
  HBL_PACO_BASE_URL
  HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY
  HBL_PACO_PACO_ENCRYPTION_PUBLIC_KEY
  HBL_PACO_PACO_SIGNING_PUBLIC_KEY
  HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY
)

for v in "${required_vars[@]}"; do
  if [ -z "${!v:-}" ]; then
    echo "ERROR: missing env $v"
    exit 1
  fi
done

HBL_PACO_REQUEST_3DS="${HBL_PACO_REQUEST_3DS:-Y}"
HBL_PACO_CURRENCY="${HBL_PACO_CURRENCY:-USD}"

PROD_MID="9104539176"
PROD_URL="https://core.paco.2c2p.com/"
PROD_KID="19f84b5655f04e25a99b09f1ee2fac78"
UAT_MID="9104137120"
UAT_KID="7664a2ed0dee4879bdfca0e8ce1ac313"

normalize_url() {
  local u="$1"
  u="${u%/}"
  printf '%s/' "$u"
}

BASE_NORM="$(normalize_url "$HBL_PACO_BASE_URL")"

if [ "$HBL_PACO_ENV" = "production" ] || [ "$HBL_PACO_ENV" = "prod" ]; then
  if [ "$HBL_PACO_OFFICE_ID" = "$UAT_MID" ]; then
    echo "ERROR: Production rejected UAT merchant ID"
    exit 1
  fi
  if [ "$HBL_PACO_OFFICE_ID" != "$PROD_MID" ]; then
    echo "ERROR: Production merchant ID mismatch"
    exit 1
  fi
  if echo "$BASE_NORM" | grep -qi 'demo-paco'; then
    echo "ERROR: Production rejected UAT demo endpoint"
    exit 1
  fi
  if [ "$BASE_NORM" != "$PROD_URL" ]; then
    echo "ERROR: Production endpoint mismatch"
    exit 1
  fi
  if [ "$HBL_PACO_ENCRYPTION_KEY_ID" = "$UAT_KID" ]; then
    echo "ERROR: Production rejected UAT encryption kid"
    exit 1
  fi
  if [ "$HBL_PACO_ENCRYPTION_KEY_ID" != "$PROD_KID" ]; then
    echo "ERROR: Production encryption kid mismatch"
    exit 1
  fi
  if [ "$HBL_PACO_REQUEST_3DS" != "Y" ]; then
    echo "ERROR: Production requires request3dsFlag=Y"
    exit 1
  fi
  if [ "$HBL_PACO_CURRENCY" != "USD" ]; then
    echo "ERROR: Production currency must be USD"
    exit 1
  fi
  if [ -n "${HBL_PACO_SDK_DEMO_SHAPE:-}" ]; then
    echo "ERROR: HBL_PACO_SDK_DEMO_SHAPE must not be set in Production"
    exit 1
  fi
fi

touch "$ENV_FILE"
chmod 600 "$ENV_FILE"
cp -a "$ENV_FILE" "/tmp/htp-env-before-paco-$(date +%s)"

grep -v '^HBL_PACO_' "$ENV_FILE" | grep -v '^# --- HBL PACO' > "$ENV_FILE.tmp" || true
mv "$ENV_FILE.tmp" "$ENV_FILE"

LABEL="PRODUCTION"
if [ "$HBL_PACO_ENV" = "uat" ]; then
  LABEL="UAT"
fi

cat >> "$ENV_FILE" <<EOF

# --- HBL PACO (${LABEL}) ---
HBL_PACO_ENV=${HBL_PACO_ENV}
HBL_PACO_OFFICE_ID=${HBL_PACO_OFFICE_ID}
HBL_PACO_API_KEY=${HBL_PACO_API_KEY}
HBL_PACO_ENCRYPTION_KEY_ID=${HBL_PACO_ENCRYPTION_KEY_ID}
HBL_PACO_BASE_URL=${HBL_PACO_BASE_URL}
HBL_PACO_REQUEST_3DS=${HBL_PACO_REQUEST_3DS}
HBL_PACO_CURRENCY=${HBL_PACO_CURRENCY}
HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY=${HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY}
HBL_PACO_PACO_ENCRYPTION_PUBLIC_KEY=${HBL_PACO_PACO_ENCRYPTION_PUBLIC_KEY}
HBL_PACO_PACO_SIGNING_PUBLIC_KEY=${HBL_PACO_PACO_SIGNING_PUBLIC_KEY}
HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY=${HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY}
EOF

upsert() {
  local key="$1"
  local val="$2"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$ENV_FILE"
  else
    printf '%s=%s\n' "$key" "$val" >> "$ENV_FILE"
  fi
}

upsert SITE_URL "${SITE_URL:-https://hotel.theglobalorbit.com}"
upsert NEXT_PUBLIC_SITE_URL "${NEXT_PUBLIC_SITE_URL:-https://hotel.theglobalorbit.com}"
upsert COOKIE_SECURE "${COOKIE_SECURE:-true}"

chmod 600 "$ENV_FILE"

echo "=== HBL_PACO keys present ==="
grep '^HBL_PACO_' "$ENV_FILE" | cut -d= -f1

echo "=== SITE vars present ==="
grep -E '^(SITE_URL|NEXT_PUBLIC_SITE_URL|COOKIE_SECURE)=' "$ENV_FILE" | cut -d= -f1

cd "$APP_DIR"
if [ "$HBL_PACO_ENV" = "production" ] || [ "$HBL_PACO_ENV" = "prod" ]; then
  node scripts/verify-paco-runtime-config.mjs .env --require-production
else
  node scripts/verify-paco-runtime-config.mjs .env
fi
