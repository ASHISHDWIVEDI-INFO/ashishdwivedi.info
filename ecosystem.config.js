/**
 * PM2 Ecosystem Config
 * Manages both Next.js frontend and Express backend on AWS Lightsail.
 *
 * Usage:
 *   pm2 start ecosystem.config.js          # start all
 *   pm2 restart ecosystem.config.js        # restart all
 *   pm2 restart portfolio-backend          # restart single
 *   pm2 logs portfolio-frontend            # view logs
 *   pm2 monit                              # live dashboard
 */

module.exports = {
  apps: [
    // ──────────────────────────────────────
    // 1. Express backend API  (port 5000)
    // ──────────────────────────────────────
    {
      name:        'portfolio-backend',
      script:      'server.js',
      cwd:         '/var/www/portfolio/backend',
      interpreter: 'node',

      // Environment
      env: {
        NODE_ENV: 'development',
        PORT:     5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT:     5000,
      },

      // Process settings
      instances:  1,           // single instance (scale up later if needed)
      exec_mode:  'fork',
      autorestart: true,
      watch:      false,       // don't watch in production
      max_memory_restart: '512M',

      // Logging
      error_file:   '/var/log/pm2/portfolio-backend-error.log',
      out_file:     '/var/log/pm2/portfolio-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs:   true,

      // Graceful shutdown
      kill_timeout:         5000,
      listen_timeout:       8000,
      shutdown_with_message: true,

      // Restart policy
      restart_delay:  3000,
      max_restarts:   10,
      min_uptime:     '10s',
    },

    // ──────────────────────────────────────
    // 2. Next.js frontend  (port 3000)
    // ──────────────────────────────────────
    {
      name:        'portfolio-frontend',
      script:      'node_modules/.bin/next',
      args:        'start --port 3000',
      cwd:         '/var/www/portfolio/frontend',

      env: {
        NODE_ENV: 'development',
        PORT:     3000,
      },
      env_production: {
        NODE_ENV:             'production',
        PORT:                 3000,
        NEXT_TELEMETRY_DISABLED: 1,
      },

      instances:  1,
      exec_mode:  'fork',
      autorestart: true,
      watch:      false,
      max_memory_restart: '512M',

      error_file:   '/var/log/pm2/portfolio-frontend-error.log',
      out_file:     '/var/log/pm2/portfolio-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs:   true,

      kill_timeout:  5000,
      listen_timeout:10000,
      restart_delay: 3000,
      max_restarts:  10,
      min_uptime:    '15s',
    },
  ],
};
