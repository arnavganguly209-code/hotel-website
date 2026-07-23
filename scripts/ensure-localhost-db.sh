#!/usr/bin/env bash
# Ensure Hotel Thamel Park uses VPS localhost PostgreSQL database "thamelpark".
# Idempotent: skips if DATABASE_URL already points at localhost thamelpark.
#
# On VPS (via deploy): bash scripts/ensure-localhost-db.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo "ERROR: .env missing"
  exit 1
fi

get_env() {
  local key="$1"
  local line val
  line="$(grep -E "^${key}=" .env | tail -1 || true)"
  [ -z "$line" ] && { echo ""; return 0; }
  val="${line#*=}"
  val="${val#\"}"
  val="${val%\"}"
  val="${val#\'}"
  val="${val%\'}"
  printf '%s\n' "$val"
}

db_host() {
  local url="$1"
  printf '%s' "$url" | sed -E 's#.*@([^/:?]+).*#\1#'
}

write_localhost_env() {
  local local_url="$1"
  LOCAL_URL="$local_url" node <<'NODE'
const fs = require("fs");
const local = process.env.LOCAL_URL;
if (!local) throw new Error("LOCAL_URL missing");
const lines = fs.readFileSync(".env", "utf8").split(/\r?\n/);
const out = [];
let replaced = false;
for (const line of lines) {
  if (!line.trim() && !replaced) {
    out.push(line);
    continue;
  }
  if (/^DATABASE_URL=/.test(line)) {
    out.push("# VPS localhost PostgreSQL only");
    out.push("DATABASE_URL=" + local);
    replaced = true;
    continue;
  }
  const key = line.split("=")[0] || "";
  // Drop legacy companion DB URL vars (anything ending in DATABASE_URL except DATABASE_URL)
  if (key !== "DATABASE_URL" && /DATABASE_URL$/i.test(key)) continue;
  if (/^DIRECT_URL=/.test(line)) continue;
  out.push(line);
}
if (!replaced) out.push("DATABASE_URL=" + local);
fs.writeFileSync(".env", out.join("\n").replace(/\n*$/, "\n"));
console.log("Wrote localhost DATABASE_URL → thamelpark");
NODE
  chmod 600 .env || true
}

CURRENT_URL="$(get_env DATABASE_URL)"
if [ -z "$CURRENT_URL" ]; then
  echo "ERROR: DATABASE_URL not set in .env"
  exit 1
fi

HOST="$(db_host "$CURRENT_URL")"
if echo "$CURRENT_URL" | grep -Eqi '(localhost|127\.0\.0\.1)' \
  && echo "$CURRENT_URL" | grep -Eqi '/thamelpark([?]|$)' \
  && echo "$HOST" | grep -Eqi '^(127\.0\.0\.1|localhost)$'; then
  echo "OK: DATABASE_URL already points at local thamelpark — ensure skipped"
  export DATABASE_URL="$CURRENT_URL"
  npx prisma generate
  npx prisma migrate deploy || npx prisma db push --accept-data-loss=false
  node scripts/ensure-thamelpark-bootstrap.mjs
  exit 0
fi

echo "========== ENSURE localhost / thamelpark =========="
date -u +"%Y-%m-%dT%H:%M:%SZ"

BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
cp -a .env "$BACKUP_DIR/env-before-localhost-${STAMP}.bak"
chmod 600 "$BACKUP_DIR/env-before-localhost-${STAMP}.bak" || true

if ! command -v psql >/dev/null 2>&1; then
  echo "Installing postgresql / postgresql-client…"
  export DEBIAN_FRONTEND=noninteractive
  set +e
  if command -v sudo >/dev/null 2>&1; then
    sudo -n apt-get update -y
    sudo -n apt-get install -y postgresql postgresql-contrib postgresql-client
    sudo -n systemctl enable --now postgresql || sudo -n service postgresql start
  else
    apt-get update -y
    apt-get install -y postgresql postgresql-contrib postgresql-client
    systemctl enable --now postgresql || service postgresql start
  fi
  set -e
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "ERROR: psql still not available after install attempt"
  exit 1
fi

set +e
if command -v sudo >/dev/null 2>&1; then
  sudo -n systemctl start postgresql 2>/dev/null || sudo -n service postgresql start 2>/dev/null
else
  systemctl start postgresql 2>/dev/null || service postgresql start 2>/dev/null
fi
set -e

LOCAL_DB="thamelpark"
LOCAL_USER="${LOCAL_DB_USER:-thamelpark}"
if [ -z "${LOCAL_DB_PASSWORD:-}" ]; then
  if command -v openssl >/dev/null 2>&1; then
    LOCAL_PASS="$(openssl rand -base64 32 | tr -d '/+=' | head -c 28)"
  else
    LOCAL_PASS="$(head -c 24 /dev/urandom | base64 | tr -d '/+=' | head -c 28)"
  fi
else
  LOCAL_PASS="$LOCAL_DB_PASSWORD"
fi
LOCAL_PASS_ENC="$(P="$LOCAL_PASS" node -e 'console.log(encodeURIComponent(process.env.P))')"
LOCAL_URL="postgresql://${LOCAL_USER}:${LOCAL_PASS_ENC}@127.0.0.1:5432/${LOCAL_DB}?schema=public"

run_as_postgres() {
  if command -v sudo >/dev/null 2>&1 && id -u postgres >/dev/null 2>&1; then
    sudo -u postgres "$@"
  else
    "$@"
  fi
}

echo "Ensuring role + database thamelpark…"
SQL_PASS="${LOCAL_PASS//\'/\'\'}"
run_as_postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${LOCAL_USER}') THEN
    CREATE ROLE ${LOCAL_USER} LOGIN PASSWORD '${SQL_PASS}';
  ELSE
    ALTER ROLE ${LOCAL_USER} WITH LOGIN PASSWORD '${SQL_PASS}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${LOCAL_DB} OWNER ${LOCAL_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${LOCAL_DB}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${LOCAL_DB} TO ${LOCAL_USER};
SQL

run_as_postgres psql -d "$LOCAL_DB" -v ON_ERROR_STOP=1 <<SQL
GRANT ALL ON SCHEMA public TO ${LOCAL_USER};
ALTER SCHEMA public OWNER TO ${LOCAL_USER};
SQL

write_localhost_env "$LOCAL_URL"
export DATABASE_URL="$LOCAL_URL"
export PGPASSWORD="$LOCAL_PASS"

echo "Prisma generate + migrate…"
npx prisma generate
set +e
npx prisma migrate deploy
MIGRATE_RC=$?
set -e
if [ "$MIGRATE_RC" -ne 0 ]; then
  echo "migrate deploy failed — prisma db push"
  npx prisma db push --accept-data-loss=false
fi

psql "postgresql://${LOCAL_USER}@127.0.0.1:5432/${LOCAL_DB}" -v ON_ERROR_STOP=1 <<SQL
GRANT ALL ON ALL TABLES IN SCHEMA public TO ${LOCAL_USER};
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ${LOCAL_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${LOCAL_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${LOCAL_USER};
SQL

echo "Bootstrapping CMS + media index into PostgreSQL…"
node scripts/ensure-thamelpark-bootstrap.mjs

echo "Verifying…"
node <<'NODE'
const { Client } = require("pg");
const fs = require("fs");
const line = fs.readFileSync(".env", "utf8").split(/\n/).find((l) => l.startsWith("DATABASE_URL="));
const url = line.slice("DATABASE_URL=".length).trim();
const host = (url.match(/@([^/:?]+)/) || [])[1] || "";
if (!/^(127\.0\.0\.1|localhost)$/i.test(host) || !/thamelpark/i.test(url)) {
  console.error("FAIL: DATABASE_URL must be localhost thamelpark");
  process.exit(1);
}
(async () => {
  const c = new Client({ connectionString: url });
  await c.connect();
  const tables = await c.query(`
    SELECT COUNT(*)::int AS n FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`);
  const content = await c.query('SELECT COUNT(*)::int AS n FROM "SiteContentRecord"');
  const media = await c.query('SELECT COUNT(*)::int AS n FROM "MediaFile"');
  console.log("VERIFY public tables =", tables.rows[0].n);
  console.log("VERIFY SiteContentRecord =", content.rows[0].n);
  console.log("VERIFY MediaFile =", media.rows[0].n);
  if (!content.rows[0].n) process.exit(1);
  await c.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
NODE

# Remove legacy env backup filenames that may contain old host strings in content
rm -f "$BACKUP_DIR"/env-before-cutover* 2>/dev/null || true

echo "========== LOCALHOST DB READY =========="
echo "DATABASE_URL → 127.0.0.1/thamelpark"
