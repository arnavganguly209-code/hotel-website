#!/usr/bin/env bash
# Migrate Hotel Thamel Park from Neon → VPS localhost PostgreSQL.
# Idempotent: skips if DATABASE_URL already uses localhost / 127.0.0.1.
#
# If Neon dump fails (e.g. transfer quota), falls back to:
#   - create local DB + prisma migrate
#   - seed CMS from data/site-content.json
#   - cut over DATABASE_URL to localhost
#   - save Neon URL for scripts/retry-neon-import.sh
#
# On VPS:  bash scripts/migrate-neon-to-localhost.sh
# Called automatically from scripts/vps-deploy.sh when Neon is detected.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo "ERROR: .env missing"
  exit 1
fi

get_env() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" .env | tail -1 || true)"
  [ -z "$line" ] && { echo ""; return 0; }
  echo "${line#*=}" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//'"
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
  if (/^DATABASE_URL=/.test(line)) {
    out.push("# Migrated off Neon — VPS localhost PostgreSQL only");
    out.push("DATABASE_URL=" + local);
    replaced = true;
  } else if (/^(NEON_DATABASE_URL|DIRECT_URL)=/.test(line)) {
    out.push("# removed: " + line.split("=")[0]);
  } else {
    out.push(line);
  }
}
if (!replaced) out.push("DATABASE_URL=" + local);
fs.writeFileSync(".env", out.join("\n").replace(/\n*$/, "\n"));
console.log("Wrote localhost DATABASE_URL");
NODE
  chmod 600 .env || true
}

ensure_local_db() {
  echo "Ensuring local role + database…"
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
}

grant_local() {
  export PGPASSWORD="$LOCAL_PASS"
  psql "postgresql://${LOCAL_USER}@127.0.0.1:5432/${LOCAL_DB}" -v ON_ERROR_STOP=1 <<SQL
GRANT ALL ON ALL TABLES IN SCHEMA public TO ${LOCAL_USER};
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ${LOCAL_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${LOCAL_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${LOCAL_USER};
SQL
}

verify_localhost() {
  node <<'NODE'
const { Client } = require("pg");
const fs = require("fs");
const line = fs.readFileSync(".env", "utf8").split(/\n/).find((l) => l.startsWith("DATABASE_URL="));
const url = line.slice("DATABASE_URL=".length).trim();
if (/neon\.tech/i.test(url)) {
  console.error("FAIL: .env still references neon.tech");
  process.exit(1);
}
if (!/127\.0\.0\.1|localhost/i.test(url)) {
  console.error("FAIL: .env is not localhost");
  process.exit(1);
}
const c = new Client({ connectionString: url });
(async () => {
  await c.connect();
  const r = await c.query('SELECT COUNT(*)::int AS n FROM "SiteContentRecord"');
  console.log("VERIFY SiteContentRecord =", r.rows[0].n);
  if (!r.rows[0].n) process.exit(1);
  const tables = await c.query(`
    SELECT COUNT(*)::int AS n FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`);
  console.log("VERIFY public tables =", tables.rows[0].n);
  await c.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
NODE
}

bootstrap_with_cms_seed() {
  echo "========== FALLBACK: localhost + CMS seed (Neon dump unavailable) =========="
  ensure_local_db
  write_localhost_env "$LOCAL_URL"
  export DATABASE_URL="$LOCAL_URL"
  export PGPASSWORD="$LOCAL_PASS"

  echo "Applying Prisma schema (migrate deploy / db push)…"
  npx prisma generate
  set +e
  npx prisma migrate deploy
  MIGRATE_STATUS=$?
  set -e
  if [ "$MIGRATE_STATUS" -ne 0 ]; then
    echo "migrate deploy failed — trying prisma db push…"
    npx prisma db push --accept-data-loss=false
  fi

  grant_local
  node scripts/seed-cms-from-json.mjs
  verify_localhost

  echo "WARN: Bookings / inquiries / newsletter / media DB rows were NOT imported from Neon."
  echo "WARN: CMS was seeded from data/site-content.json (committed $(date -u +%Y-%m-%d))."
  echo "WARN: When Neon quota resets, run: bash scripts/retry-neon-import.sh"
  echo "Neon URL saved under $BACKUP_DIR for retry."
  echo "========== FALLBACK MIGRATION COMPLETE =========="
}

CURRENT_URL="$(get_env DATABASE_URL)"
if [ -z "$CURRENT_URL" ]; then
  echo "ERROR: DATABASE_URL not set in .env"
  exit 1
fi

if echo "$CURRENT_URL" | grep -Eqi '(localhost|127\.0\.0\.1)' \
  && ! echo "$CURRENT_URL" | grep -Eqi 'neon\.tech'; then
  echo "OK: DATABASE_URL already points at local PostgreSQL — migration skipped"
  exit 0
fi

if ! echo "$CURRENT_URL" | grep -Eqi 'neon\.tech'; then
  echo "WARN: DATABASE_URL is not Neon and not localhost — refusing automatic migration"
  echo "Host=$(echo "$CURRENT_URL" | sed -E 's#.*@([^/:]+).*#\1#')"
  exit 1
fi

echo "========== NEON → LOCALHOST MIGRATION =========="
echo "Source host: $(echo "$CURRENT_URL" | sed -E 's#.*@([^/:]+).*#\1#')"
date -u +"%Y-%m-%dT%H:%M:%SZ"

for bin in pg_dump psql; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "ERROR: $bin not found. Install: apt-get install -y postgresql-client postgresql"
    exit 1
  fi
done

BACKUP_DIR="${BACKUP_DIR:-/var/backups/hotel-thamel-park}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DUMP_CUSTOM="$BACKUP_DIR/neon-full-${STAMP}.dump"
DUMP_SQL="$BACKUP_DIR/neon-full-${STAMP}.sql"
ENV_BACKUP="$BACKUP_DIR/env-before-migration-${STAMP}.bak"

cp -a .env "$ENV_BACKUP"
echo "Backed up .env → $ENV_BACKUP"
printf '%s\n' "$CURRENT_URL" > "$BACKUP_DIR/neon-url-${STAMP}.secret"
chmod 600 "$BACKUP_DIR/neon-url-${STAMP}.secret" "$ENV_BACKUP" || true

LOCAL_DB="${LOCAL_DB_NAME:-hotel_thamel_park}"
LOCAL_USER="${LOCAL_DB_USER:-hotel_thamel}"
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

echo "Dumping Neon (custom format)…"
USE_CUSTOM=1
DUMP_OK=0
set +e
PGSSLMODE=require pg_dump "$CURRENT_URL" --no-owner --no-acl --format=custom --file="$DUMP_CUSTOM" 2>"$BACKUP_DIR/pg-dump-${STAMP}.err"
DUMP_STATUS=$?
set -e
if [ "$DUMP_STATUS" -eq 0 ] && [ -s "$DUMP_CUSTOM" ]; then
  DUMP_OK=1
  echo "Dump OK: $DUMP_CUSTOM ($(du -h "$DUMP_CUSTOM" | awk '{print $1}'))"
else
  echo "Custom dump failed — trying plain SQL…"
  set +e
  PGSSLMODE=require pg_dump "$CURRENT_URL" --no-owner --no-acl --format=plain --file="$DUMP_SQL" 2>>"$BACKUP_DIR/pg-dump-${STAMP}.err"
  DUMP_STATUS=$?
  set -e
  if [ "$DUMP_STATUS" -eq 0 ] && [ -s "$DUMP_SQL" ]; then
    USE_CUSTOM=0
    DUMP_OK=1
    echo "SQL dump OK: $DUMP_SQL"
  else
    echo "Neon dump FAILED (likely transfer quota). Last error:"
    tail -n 20 "$BACKUP_DIR/pg-dump-${STAMP}.err" || true
    if [ "${ALLOW_CMS_SEED_FALLBACK:-1}" = "1" ]; then
      bootstrap_with_cms_seed
      exit 0
    fi
    echo "ERROR: Set ALLOW_CMS_SEED_FALLBACK=1 to cut over with committed CMS JSON, or restore Neon quota and re-run."
    exit 1
  fi
fi

ensure_local_db

echo "Importing Neon dump into 127.0.0.1…"
export PGPASSWORD="$LOCAL_PASS"
if [ "$USE_CUSTOM" = "1" ]; then
  set +e
  pg_restore --clean --if-exists --no-owner --no-acl \
    --dbname="postgresql://${LOCAL_USER}@127.0.0.1:5432/${LOCAL_DB}" \
    "$DUMP_CUSTOM"
  set -e
else
  psql "postgresql://${LOCAL_USER}@127.0.0.1:5432/${LOCAL_DB}" -v ON_ERROR_STOP=1 -f "$DUMP_SQL"
fi

grant_local

echo "Table counts:"
psql "postgresql://${LOCAL_USER}@127.0.0.1:5432/${LOCAL_DB}" -c \
  "SELECT relname AS table, n_live_tup AS rows FROM pg_stat_user_tables ORDER BY 1;"

CONTENT_ROWS="$(psql "postgresql://${LOCAL_USER}@127.0.0.1:5432/${LOCAL_DB}" -tAc \
  'SELECT COUNT(*) FROM "SiteContentRecord";' | tr -d '[:space:]')"
if [ -z "$CONTENT_ROWS" ] || [ "$CONTENT_ROWS" = "0" ]; then
  echo "ERROR: SiteContentRecord empty after import — refusing .env cutover"
  if [ "${ALLOW_CMS_SEED_FALLBACK:-1}" = "1" ]; then
    echo "Seeding CMS from data/site-content.json…"
    write_localhost_env "$LOCAL_URL"
    export DATABASE_URL="$LOCAL_URL"
    npx prisma generate
    npx prisma migrate deploy || npx prisma db push --accept-data-loss=false
    node scripts/seed-cms-from-json.mjs
  else
    echo "Restore .env from $ENV_BACKUP if needed"
    exit 1
  fi
fi

echo "SiteContentRecord rows: ${CONTENT_ROWS:-seeded}"

echo "Cutting over .env DATABASE_URL → 127.0.0.1"
write_localhost_env "$LOCAL_URL"
verify_localhost

echo "========== MIGRATION COMPLETE =========="
echo "App must reload PM2 to pick up .env (deploy script will restart)."
echo "Neon dump retained under $BACKUP_DIR"
