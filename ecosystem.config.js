/**
 * PM2 — Hostinger VPS only (https://hotel.theglobalorbit.com)
 * Nginx should proxy_pass to http://127.0.0.1:3000
 */
module.exports = {
  apps: [
    {
      name: "hotel-thamel-park",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
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
      },
    },
  ],
};
