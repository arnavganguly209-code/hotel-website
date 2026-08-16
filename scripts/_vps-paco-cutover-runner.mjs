/**
 * Builds a remote cutover script from local .env and runs it on the VPS via SSH.
 * Usage: node scripts/_vps-paco-cutover-runner.mjs
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const root = process.cwd();
const envPath = path.join(root, ".env");
const sshKey = path.join(process.env.USERPROFILE || "", ".ssh", "orbit_webmail_ed25519");
const host = process.env.VPS_HOST || "200.97.170.235";
const user = process.env.VPS_USER || "root";

if (!fs.existsSync(envPath)) {
  console.error("Missing .env");
  process.exit(1);
}

const envText = fs.readFileSync(envPath, "utf8");
const blockMatch = envText.match(/# --- HBL PACO[\s\S]*/);
if (!blockMatch) {
  console.error("No HBL PACO block in .env");
  process.exit(1);
}
const pacoBlock = blockMatch[0].trimEnd();

const remoteScript = `#!/usr/bin/env bash
set -euo pipefail
ENV_FILE=/var/www/hotel-website/.env
APP_DIR=/var/www/hotel-website
touch "$ENV_FILE"
chmod 600 "$ENV_FILE"
cp -a "$ENV_FILE" "/tmp/htp-env-before-paco-$(date +%s)"

# Remove prior HBL PACO lines (preserve everything else)
grep -v '^HBL_PACO_' "$ENV_FILE" | grep -v '^# --- HBL PACO' > "$ENV_FILE.tmp" || true
mv "$ENV_FILE.tmp" "$ENV_FILE"

upsert() {
  local key="$1"
  local val="$2"
  if grep -q "^\${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i "s|^\${key}=.*|\${key}=\${val}|" "$ENV_FILE"
  else
    printf '%s=%s\\n' "$key" "$val" >> "$ENV_FILE"
  fi
}

cat >> "$ENV_FILE" << 'PACOEOF'

${pacoBlock}
PACOEOF

upsert SITE_URL https://hotelthamelpark.com
upsert NEXT_PUBLIC_SITE_URL https://hotelthamelpark.com
upsert COOKIE_SECURE true

cd "$APP_DIR"
set +e
source scripts/vps-env.sh
set -e
npx prisma migrate deploy
node scripts/pm2-reload-from-dotenv.mjs

echo "=== HBL_PACO keys (redacted) ==="
grep '^HBL_PACO_' "$ENV_FILE" | sed 's/=.*$/=***/'
echo "=== SITE URL vars ==="
grep -E '^(SITE_URL|NEXT_PUBLIC_SITE_URL|COOKIE_SECURE)=' "$ENV_FILE" | sed 's/=.*$/=***/'

node -e "
require('dotenv').config({path:'.env'});
const ok = [
  process.env.HBL_PACO_OFFICE_ID,
  process.env.HBL_PACO_API_KEY,
  process.env.HBL_PACO_MERCHANT_SIGNING_PRIVATE_KEY,
  process.env.HBL_PACO_PACO_ENCRYPTION_PUBLIC_KEY,
  process.env.HBL_PACO_PACO_SIGNING_PUBLIC_KEY,
  process.env.HBL_PACO_MERCHANT_DECRYPTION_PRIVATE_KEY,
].every(v => (v||'').trim());
console.log('isPacoConfigured:', ok);
"

pm2 describe hotel-thamel-park | head -20
pm2 logs hotel-thamel-park --lines 15 --nostream 2>/dev/null || true
`;

const args = [
  "-i",
  sshKey,
  "-o",
  "BatchMode=yes",
  "-o",
  "ConnectTimeout=60",
  "-o",
  "StrictHostKeyChecking=accept-new",
  `${user}@${host}`,
  "bash -s",
];

console.info("Running VPS PACO cutover on", `${user}@${host}`);
const r = spawnSync("ssh", args, {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
  input: remoteScript,
});
process.stdout.write(r.stdout || "");
process.stderr.write(r.stderr || "");
process.exit(r.status ?? 1);
