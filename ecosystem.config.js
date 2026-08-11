/**
 * PM2 — Hostinger VPS only (https://hotel.theglobalorbit.com)
 * Nginx should proxy_pass to http://127.0.0.1:3000
 *
 * Always start from this file's directory so Next can resolve
 * node_modules/next/dist/server/web/* (never load from a broken cwd).
 *
 * HBL PACO values are loaded from `.env` here so `pm2 reload --update-env`
 * cannot keep a stale UAT dump after the file is switched to Production.
 */
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const ROOT = __dirname;
const envPath = path.join(ROOT, ".env");
const parsed = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};

const paco = {};
for (const [key, value] of Object.entries(parsed)) {
  if (key.startsWith("HBL_PACO_")) paco[key] = value;
}

const pacoMode = String(paco.HBL_PACO_ENV || "").toLowerCase();
if (pacoMode === "production" || pacoMode === "prod") {
  if (paco.HBL_PACO_OFFICE_ID === "9104137120") {
    throw new Error("ecosystem.config.js: Production .env must not use UAT MID 9104137120");
  }
  if (paco.HBL_PACO_OFFICE_ID !== "9104539176") {
    throw new Error("ecosystem.config.js: Production MID mismatch");
  }
  if (!paco.HBL_PACO_BASE_URL || /demo-paco/i.test(String(paco.HBL_PACO_BASE_URL))) {
    throw new Error("ecosystem.config.js: Production .env must not use demo-paco");
  }
  if (!/^https:\/\/core\.paco\.2c2p\.com\/?$/i.test(String(paco.HBL_PACO_BASE_URL || "").trim())) {
    throw new Error("ecosystem.config.js: Production endpoint must be https://core.paco.2c2p.com");
  }
  if (paco.HBL_PACO_ENCRYPTION_KEY_ID === "7664a2ed0dee4879bdfca0e8ce1ac313") {
    throw new Error("ecosystem.config.js: Production .env must not use UAT kid");
  }
  if (paco.HBL_PACO_ENCRYPTION_KEY_ID !== "19f84b5655f04e25a99b09f1ee2fac78") {
    throw new Error("ecosystem.config.js: Production kid mismatch");
  }
  if (String(paco.HBL_PACO_CURRENCY || "USD").trim().toUpperCase() !== "USD") {
    throw new Error("ecosystem.config.js: Production currency must be USD");
  }
  if (String(paco.HBL_PACO_REQUEST_3DS || "Y").trim() !== "Y") {
    throw new Error("ecosystem.config.js: Production request3dsFlag must be Y");
  }
  if (paco.HBL_PACO_SDK_DEMO_SHAPE) {
    throw new Error("ecosystem.config.js: HBL_PACO_SDK_DEMO_SHAPE must not be set in Production");
  }
}

module.exports = {
  apps: [
    {
      name: "hotel-thamel-park",
      cwd: ROOT,
      script: path.join(ROOT, "node_modules", "next", "dist", "bin", "next"),
      args: "start -H 0.0.0.0 -p 3000",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "768M",
      time: true,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        UPLOADS_ROOT: path.join(ROOT, "public", "uploads"),
        ...paco,
      },
    },
  ],
};
