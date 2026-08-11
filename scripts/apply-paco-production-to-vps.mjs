#!/usr/bin/env node
/**
 * SCP a Production PACO env fragment (outside git) to the VPS and merge it.
 * Never prints secret values. Does not git-commit.
 *
 * Usage: node scripts/apply-paco-production-to-vps.mjs --env-file "C:/Users/Admin/Desktop/hbl key/paco-production.env"
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : null;
}

const envFile =
  arg("--env-file") || path.join("C:/Users/Admin/Desktop/hbl key", "paco-production.env");
const sshKey =
  arg("--ssh-key") || path.join(process.env.USERPROFILE || process.env.HOME || "", ".ssh", "orbit_webmail_ed25519");
const host = process.env.VPS_HOST || "200.97.170.235";
const user = process.env.VPS_USER || "root";
const appDir = "/var/www/hotel-website";
const remoteTmp = "/root/htp-paco-production.env";

if (!fs.existsSync(envFile)) {
  console.error("FAIL: production env fragment not found");
  process.exit(1);
}
if (!fs.existsSync(sshKey)) {
  console.error("FAIL: SSH key not found");
  process.exit(1);
}

const text = fs.readFileSync(envFile, "utf8");
const required = [
  "HBL_PACO_ENV=production",
  "HBL_PACO_OFFICE_ID=9104539176",
  "HBL_PACO_ENCRYPTION_KEY_ID=19f84b5655f04e25a99b09f1ee2fac78",
  "HBL_PACO_BASE_URL=https://core.paco.2c2p.com/",
  "HBL_PACO_REQUEST_3DS=Y",
  "HBL_PACO_CURRENCY=USD",
];
for (const line of required) {
  if (!text.includes(line)) {
    console.error("FAIL: env fragment missing required production line");
    process.exit(1);
  }
}
if (text.includes("9104137120") || /demo-paco/i.test(text) || text.includes("7664a2ed0dee4879bdfca0e8ce1ac313")) {
  console.error("FAIL: env fragment still contains UAT identifiers");
  process.exit(1);
}
if (/NEXT_PUBLIC_.*HBL|NEXT_PUBLIC_.*PACO|NEXT_PUBLIC_.*API_KEY/.test(text)) {
  console.error("FAIL: env fragment exposes PACO secrets via NEXT_PUBLIC_");
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  });
  if (res.status !== 0) {
    const err = (res.stderr || res.stdout || "").trim();
    console.error("FAIL:", cmd, args[0] || "");
    if (err) {
      const redacted = err
        .replace(/HBL_PACO_API_KEY=.*/g, "HBL_PACO_API_KEY=[redacted]")
        .replace(/HBL_PACO_MERCHANT_[A-Z_]+=.*/g, (m) => m.split("=")[0] + "=[redacted]")
        .replace(/HBL_PACO_PACO_[A-Z_]+=.*/g, (m) => m.split("=")[0] + "=[redacted]");
      console.error(redacted.slice(0, 800));
    }
    process.exit(res.status || 1);
  }
  return res.stdout || "";
}

const sshBase = [
  "-i",
  sshKey,
  "-o",
  "BatchMode=yes",
  "-o",
  "ConnectTimeout=60",
  "-o",
  "StrictHostKeyChecking=accept-new",
];

console.log("Uploading Production PACO env fragment (values not printed)...");
run("scp", [...sshBase, envFile, `${user}@${host}:${remoteTmp}`]);

const remote = `set -euo pipefail
exec 9>/tmp/htp-prod-deploy.lock
flock 9
chmod 600 ${remoteTmp}
APP_DIR=${appDir}
ENV_FILE="$APP_DIR/.env"
cp -a "$ENV_FILE" "/tmp/htp-env-before-paco-prod-$(date +%s)"
grep -v '^HBL_PACO_' "$ENV_FILE" | grep -v '^# --- HBL PACO' | grep -v '^BOOKING_CURRENCY=' > "$ENV_FILE.tmp" || true
cat "$ENV_FILE.tmp" ${remoteTmp} > "$ENV_FILE.new"
mv "$ENV_FILE.new" "$ENV_FILE"
rm -f "$ENV_FILE.tmp"
chmod 600 "$ENV_FILE"
shred -u ${remoteTmp} 2>/dev/null || rm -f ${remoteTmp}
cd "$APP_DIR"
node scripts/verify-paco-runtime-config.mjs .env --require-production
set +e
. "$APP_DIR/scripts/vps-env.sh"
set -e
node scripts/pm2-reload-from-dotenv.mjs
sleep 8
node scripts/verify-paco-runtime-config.mjs .env --require-production
curl -sS -o /dev/null -w "http_status=%{http_code}\\n" --max-time 20 https://hotel.theglobalorbit.com/
pm2 describe hotel-thamel-park | head -18
pm2 logs hotel-thamel-park --lines 20 --nostream 2>/dev/null | sed -E 's/(HBL_PACO_API_KEY|BEGIN (RSA )?PRIVATE KEY|CompanyApiKey)[^ ]*/[redacted]/g' || true
`;

console.log("Merging Production PACO env on VPS (values not printed)...");
const out = run("ssh", [...sshBase, `${user}@${host}`, remote]);
console.log(out.trim());
console.log("Production PACO env applied on VPS.");
