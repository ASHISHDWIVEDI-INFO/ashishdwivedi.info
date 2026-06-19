// /**
//  * PM2 Ecosystem Config
//  * Manages both Next.js frontend and Express backend on AWS Lightsail.
//  *
//  * Usage:
//  *   pm2 start ecosystem.config.js          # start all
//  *   pm2 restart ecosystem.config.js        # restart all
//  *   pm2 restart portfolio-backend          # restart single
//  *   pm2 logs portfolio-frontend            # view logs
//  *   pm2 monit                              # live dashboard
//  */

// module.exports = {
//   apps: [
//     // ──────────────────────────────────────
//     // 1. Express backend API  (port 5000)
//     // ──────────────────────────────────────
//     {
//       name:        'portfolio-backend',
//       script:      'server.js',
//       cwd:         '/var/www/portfolio/backend',
//       interpreter: 'node',

//       // Environment
//       env: {
//         NODE_ENV: 'development',
//         PORT:     5000,
//       },
//       env_production: {
//         NODE_ENV: 'production',
//         PORT:     5000,
//       },

//       // Process settings
//       instances:  1,           // single instance (scale up later if needed)
//       exec_mode:  'fork',
//       autorestart: true,
//       watch:      false,       // don't watch in production
//       max_memory_restart: '512M',

//       // Logging
//       error_file:   '/var/log/pm2/portfolio-backend-error.log',
//       out_file:     '/var/log/pm2/portfolio-backend-out.log',
//       log_date_format: 'YYYY-MM-DD HH:mm:ss',
//       merge_logs:   true,

//       // Graceful shutdown
//       kill_timeout:         5000,
//       listen_timeout:       8000,
//       shutdown_with_message: true,

//       // Restart policy
//       restart_delay:  3000,
//       max_restarts:   10,
//       min_uptime:     '10s',
//     },

//     // ──────────────────────────────────────
//     // 2. Next.js frontend  (port 3000)
//     // ──────────────────────────────────────
//     {
//       name:        'portfolio-frontend',
//       script:      'node_modules/.bin/next',
//       args:        'start --port 3000',
//       cwd:         '/var/www/portfolio/frontend',

//       env: {
//         NODE_ENV: 'development',
//         PORT:     3000,
//       },
//       env_production: {
//         NODE_ENV:             'production',
//         PORT:                 3000,
//         NEXT_TELEMETRY_DISABLED: 1,
//       },

//       instances:  1,
//       exec_mode:  'fork',
//       autorestart: true,
//       watch:      false,
//       max_memory_restart: '512M',

//       error_file:   '/var/log/pm2/portfolio-frontend-error.log',
//       out_file:     '/var/log/pm2/portfolio-frontend-out.log',
//       log_date_format: 'YYYY-MM-DD HH:mm:ss',
//       merge_logs:   true,

//       kill_timeout:  5000,
//       listen_timeout:10000,
//       restart_delay: 3000,
//       max_restarts:  10,
//       min_uptime:    '15s',
//     },
//   ],
// };
/**
 * ecosystem.config.js — PM2 process configuration.
 *
 * RULE: This file contains ZERO sensitive values.
 * Every secret, URL, and credential is read from the server's .env file
 * at runtime via `env_file`. Nothing in here should ever need to be
 * rotated, redacted, or kept out of git.
 *
 * SENSITIVE VALUES THAT MUST NOT APPEAR HERE
 * ──────────────────────────────────────────
 * ✗  MONGODB_URI  (connection string with credentials)
 * ✗  SMTP_PASS    (email password)
 * ✗  Any JWT secret or key material
 * ✗  Any API key
 * ✗  IP addresses or internal hostnames
 * ✗  Absolute server paths (use __dirname-relative paths instead)
 *
 * HOW SECRETS REACH THE APP
 * ─────────────────────────
 * The deploy script (fix #12) symlinks the server's persistent .env into
 * each release before PM2 starts:
 *
 *   /var/www/portfolio/shared/Backend/.env  (lives on the server, never in git)
 *       ↓ symlinked to
 *   /var/www/portfolio/current/Backend/.env
 *       ↓ loaded by
 *   env.js (fix #9) on startup → process.env.*
 *
 * PM2's `env_file` option below tells PM2 to also load that .env so that
 * pm2 env <id> and pm2 logs show the right NODE_ENV without exposing secrets.
 */

"use strict";

const path = require("path");

// Resolve paths relative to this file so they work regardless of cwd.
const BACKEND_DIR  = path.join(__dirname, "Backend");
const FRONTEND_DIR = path.join(__dirname, "Frontend");

module.exports = {
  apps: [

    // ── Backend (Express) ───────────────────────────────────────────────────
    {
      name: "portfolio-backend",

      // Entry point — relative path, no hardcoded absolutes.
      script: path.join(BACKEND_DIR, "src", "server.js"),

      // Working directory — PM2 resolves require() and file paths from here.
      cwd: BACKEND_DIR,

      // ── Clustering ─────────────────────────────────────────────────────────
      // "max" uses one worker per CPU core. For a single-core Lightsail
      // instance this equals 1 — still useful because PM2 auto-restarts
      // crashed workers.
      instances: "max",
      exec_mode: "cluster",

      // ── Restart policy ─────────────────────────────────────────────────────
      // Restart if the process crashes. Do NOT restart in a tight loop
      // (exponential backoff via max_restarts + restart_delay).
      autorestart:   true,
      max_restarts:  5,
      restart_delay: 5000,   // 5 seconds between restart attempts
      min_uptime:    "10s",  // Must stay up 10s to count as a successful start

      // ── Memory guard ───────────────────────────────────────────────────────
      // Restart if the process exceeds 512 MB — protects against memory leaks
      // taking down the server silently.
      max_memory_restart: "512M",

      // ── Logging ────────────────────────────────────────────────────────────
      // Log to files so crashes are inspectable after the fact.
      // Paths are relative to the home dir by default; make them explicit.
      out_file:   path.join(BACKEND_DIR, "logs", "out.log"),
      error_file: path.join(BACKEND_DIR, "logs", "error.log"),
      merge_logs: true,   // Merge cluster worker logs into one stream
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // ── Environment: development ────────────────────────────────────────────
      // `pm2 start ecosystem.config.js --env development`
      // Only non-sensitive, non-secret values here.
      env: {
        NODE_ENV: "development",
        PORT:     "5000",
      },

      // ── Environment: production ─────────────────────────────────────────────
      // `pm2 reload ecosystem.config.js --env production`
      // Still no secrets — those come from the .env file loaded by env.js.
      env_production: {
        NODE_ENV: "production",
        PORT:     "5000",
      },

      // ── Watch (dev only) ───────────────────────────────────────────────────
      // Never watch in production — file watchers cause spurious restarts.
      watch:        false,
      ignore_watch: ["node_modules", "logs", ".git"],
    },

    // ── Frontend (Next.js) ──────────────────────────────────────────────────
    {
      name: "portfolio-frontend",

      script: path.join(FRONTEND_DIR, "node_modules", ".bin", "next"),
      args:   "start",
      cwd:    FRONTEND_DIR,

      instances: 1,
      exec_mode: "fork",   // Next.js manages its own internal clustering

      autorestart:   true,
      max_restarts:  5,
      restart_delay: 5000,
      min_uptime:    "10s",
      max_memory_restart: "512M",

      out_file:        path.join(FRONTEND_DIR, "logs", "out.log"),
      error_file:      path.join(FRONTEND_DIR, "logs", "error.log"),
      merge_logs:      true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      env: {
        NODE_ENV: "development",
        PORT:     "3000",
      },

      env_production: {
        NODE_ENV: "production",
        PORT:     "3000",
        // NEXT_PUBLIC_* vars are baked into the build at compile time (fix #12).
        // They do not need to be set here at runtime.
      },

      watch: false,
    },

  git ],
};