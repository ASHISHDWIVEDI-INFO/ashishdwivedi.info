/**
 * changePassword.controller.js
 * ─────────────────────────────
 * Handles POST /api/auth/change-password
 *
 * Works for two cases:
 *   1. Forced change — mustChangePassword is true (seeded temp password).
 *      After success, clears the flag so the user gets full API access.
 *
 *   2. Voluntary change — admin changing their own password at any time.
 *
 * In both cases, currentPassword must match the stored hash (prevents an
 * attacker who only has a valid JWT from resetting the password).
 *
 * WIRE UP IN ROUTES
 * ─────────────────
 *   const { protect } = require("../middleware/authMiddleware");
 *   const { changePassword } = require("../controllers/changePassword.controller");
 *
 *   router.post("/api/auth/change-password", protect, changePassword);
 *
 *   NOTE: Do NOT add requirePasswordChange middleware to this route —
 *   it must stay accessible when mustChangePassword is true.
 */

"use strict";

const bcrypt = require("bcryptjs");
const User   = require("../models/User.model"); // adjust path to your actual User model

// Minimum password requirements — tighten to match your policy.
const MIN_PASSWORD_LENGTH = 12;

/**
 * @param {import("express").Request}  req
 * @param {import("express").Response} res
 */
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  // ── Input validation ─────────────────────────────────────────────────────
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "currentPassword and newPassword are required.",
    });
  }

  if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `newPassword must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different from the current password.",
    });
  }

  // ── Fetch user ───────────────────────────────────────────────────────────
  const user = await User.findById(req.user.id).select("password mustChangePassword");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  // ── Verify current password ──────────────────────────────────────────────
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect.",
    });
  }

  // ── Hash and save new password ───────────────────────────────────────────
  user.password           = await bcrypt.hash(newPassword, 12);
  user.mustChangePassword = false;   // ← clears the forced-change flag
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password updated successfully.",
  });
}

module.exports = { changePassword };
