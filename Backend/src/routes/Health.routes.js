/**
 * health.routes.js
 * ─────────────────
 * GET /health — liveness + readiness check for CI smoke tests and uptime monitors.
 *
 * TWO RESPONSE STATES
 * ───────────────────
 * 200 { status: "ok",      ... }  — everything is healthy, deploy can proceed
 * 503 { status: "degraded", ... } — something is wrong, rollback should trigger
 *
 * WHAT IS CHECKED
 * ───────────────
 * 1. MongoDB  — mongoose.connection.readyState === 1 (connected)
 *              + a lightweight ping command to verify the connection is live,
 *              not just that mongoose thinks it is.
 *
 * 2. Memory   — process.memoryUsage().heapUsed vs max_memory_restart (512 MB).
 *              Returns a warning in the payload if over 80% — doesn't fail the
 *              check, but makes it visible in CI logs and uptime dashboards.
 *
 * 3. Uptime   — process.uptime() — useful for spotting recent restarts in logs.
 *
 * WHAT IS NOT CHECKED
 * ───────────────────
 * • Email (SMTP) — transient external dependency, failure shouldn't block deploys.
 * • GridFS — checked implicitly by the MongoDB ping.
 * • JWT secret store — loaded at startup; if it failed the process would be down.
 *
 * WIRE UP (app.js)
 * ────────────────
 *   const healthRouter = require("./src/routes/health.routes");
 *
 *   // Mount BEFORE auth middleware — health check must be publicly accessible.
 *   // Mount BEFORE rate limiters — uptime monitors hit this every 30s.
 *   app.use("/health", healthRouter);
 */

"use strict";

const express  = require("express");
const mongoose = require("mongoose");
const router   = express.Router();

// Memory threshold for a warning flag in the response payload.
const MEMORY_WARN_THRESHOLD = 0.80;   // 80% of max
const MEMORY_MAX_BYTES      = 512 * 1024 * 1024;  // matches max_memory_restart in ecosystem.config.js

// ── GET /health ───────────────────────────────────────────────────────────────

router.get("/", async (req, res) => {
  const checks   = {};
  let   isHealthy = true;

  // ── 1. MongoDB ──────────────────────────────────────────────────────────────

  const mongoState = mongoose.connection.readyState;
  //  0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

  if (mongoState !== 1) {
    checks.mongodb = {
      status:  "fail",
      message: `Mongoose readyState is ${mongoState} (expected 1)`,
    };
    isHealthy = false;
  } else {
    // Send an actual ping command — proves the TCP connection is live,
    // not just that mongoose cached a stale "connected" state.
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      const latencyMs = Date.now() - start;

      checks.mongodb = {
        status:    "ok",
        latencyMs,
      };
    } catch (err) {
      checks.mongodb = {
        status:  "fail",
        message: `Ping failed: ${err.message}`,
      };
      isHealthy = false;
    }
  }

  // ── 2. Memory ───────────────────────────────────────────────────────────────

  const mem         = process.memoryUsage();
  const heapUsedMB  = Math.round(mem.heapUsed  / 1024 / 1024);
  const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
  const rssMB       = Math.round(mem.rss       / 1024 / 1024);
  const usageRatio  = mem.heapUsed / MEMORY_MAX_BYTES;

  checks.memory = {
    status:      usageRatio > MEMORY_WARN_THRESHOLD ? "warn" : "ok",
    heapUsedMB,
    heapTotalMB,
    rssMB,
    usagePct:    Math.round(usageRatio * 100),
  };

  // Memory warning doesn't fail the health check — it's informational.
  // PM2's max_memory_restart will handle it if it keeps climbing.

  // ── 3. Process info ─────────────────────────────────────────────────────────

  const uptimeSeconds = Math.round(process.uptime());

  checks.process = {
    status:        "ok",
    uptimeSeconds,
    uptimeHuman:   formatUptime(uptimeSeconds),
    nodeVersion:   process.version,
    pid:           process.pid,
  };

  // ── Response ────────────────────────────────────────────────────────────────

  const statusCode = isHealthy ? 200 : 503;
  const status     = isHealthy ? "ok" : "degraded";

  return res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    checks,
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600)  / 60);
  const s = seconds % 60;
  return [
    d && `${d}d`,
    h && `${h}h`,
    m && `${m}m`,
    `${s}s`,
  ].filter(Boolean).join(" ");
}

module.exports = router;
