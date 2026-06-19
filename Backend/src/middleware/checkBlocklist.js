/**
 * checkBlocklist.js
 * ──────────────────
 * Middleware that rejects requests carrying a revoked token.
 *
 * MUST run AFTER the `protect` middleware (which sets req.user and req.tokenPayload).
 *
 * WIRE UP
 * ───────
 * Option A — globally on all protected routes (recommended):
 *
 *   const { protect }      = require("./authMiddleware");
 *   const checkBlocklist   = require("./checkBlocklist");
 *
 *   app.use("/api", protect, checkBlocklist, apiRouter);
 *
 * Option B — per-router:
 *
 *   router.use(protect, checkBlocklist);
 *
 * PERFORMANCE NOTE
 * ────────────────
 * Each request hits MongoDB once for the jti lookup + once for the sentinel.
 * For a single-admin portfolio site this is negligible.
 * If you ever scale to many users, add a Redis layer in front of the DB check.
 */

"use strict";

const { isTokenBlocked } = require("../utils/jwt");

/**
 * @param {import("express").Request}      req
 * @param {import("express").Response}     res
 * @param {import("express").NextFunction} next
 */
async function checkBlocklist(req, res, next) {
  // req.tokenPayload is set by the protect middleware (see authMiddleware.js below).
  // If it's missing, protect already rejected the request — nothing to do here.
  if (!req.tokenPayload) return next();

  try {
    const blocked = await isTokenBlocked(req.tokenPayload);
    if (blocked) {
      return res.status(401).json({
        success: false,
        code:    "TOKEN_REVOKED",
        message: "This token has been revoked. Please log in again.",
      });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = checkBlocklist;