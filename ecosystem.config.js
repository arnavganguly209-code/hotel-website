/**
 * PM2 process file for Hostinger VPS (Ubuntu + Nginx + Node.js).
 *
 * Usage:
 *   npm run build
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 *
 * Nginx should proxy_pass to http://127.0.0.1:3000
 * and set client_max_body_size 10M; for Orbit image uploads.
 */
module.exports = {
  apps: [
    {
      name: "hotel-thamel-park-spa",
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
