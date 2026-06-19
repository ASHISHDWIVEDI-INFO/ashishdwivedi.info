/**
 * requirePasswordChange.js
 * ─────────────────────────
 * Middleware that blocks every authenticated request when mustChangePassword
 * is true on the logged-in user's account.
 *
 * This closes the gap where an admin could log in with the seeded temp password
 * and then use the API indefinitely without ever setting a real password.
 *
 * PLACE THIS MIDDLEWARE:
 *   Apply it AFTER your existing `protect` (auth) middleware, before route handlers.
 *   It only makes sense on authenticated routes — unauthenticated routes are unaffected.
 *
 * ALLOWED THROUGH (even when mustChangePassword is true):
 *   POST /api/auth/change-password   ← the only way to clear the flag
 *   POST /api/auth/logout            ← always allowed
 *
 * USAGE IN ROUTES
 * ───────────────
 *   const { protect } = require("../middleware/authMiddleware");
 *   const requirePasswordChange = require("../middleware/requirePasswordChange");
 *
 *   // Apply globally to all protected routes:
 *   router.use(protect, requirePasswordChange);
 *
 *   // Or mount on the main app router after protect:
 *   app.use("/api", protect, requirePasswordChange, apiRouter);
 */

"use strict";

const User = require("../models/User.model"); // adjust path to your actual User model

// Routes that are always permitted regardless of mustChangePassword.
const ALLOWED_PATHS = [
  "/api/auth/change-password",
  "/api/auth/logout",
];

/**
 * @param {import("express").Request}  req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
async function requirePasswordChange(req, res, next) {
  // Normalize path: strip trailing slash, lowercase for comparison.
  const reqPath = req.path.replace(/\/$/, "").toLowerCase();

  // Always allow the exempt routes through.
  if (ALLOWED_PATHS.some((p) => reqPath === p || reqPath.startsWith(p + "/"))) {
    return next();
  }

  // req.user is set by the protect middleware before this runs.
  if (!req.user?.id) {
    // No authenticated user — let the auth middleware handle it.
    return next();
  }

  try {
    // Fetch the flag fresh from DB.
    // We avoid trusting the JWT payload for this because a token issued
    // before the flag was set would carry stale data.
    const user = await User.findById(req.user.id).select("mustChangePassword").lean();

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    if (user.mustChangePassword) {
      return res.status(403).json({
        success: false,
        code:    "MUST_CHANGE_PASSWORD",
        message:
          "You must change your temporary password before using the API. " +
          "POST to /api/auth/change-password with { currentPassword, newPassword }.",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requirePasswordChange;
