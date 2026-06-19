/**
 * TokenBlocklist.model.js
 * ────────────────────────
 * Stores the jti (JWT ID) of every token that has been explicitly invalidated
 * (via logout, forced sign-out, or secret rotation).
 *
 * WHY jti, not the full token string?
 *   • Smaller storage footprint — a UUID is 36 chars vs 200+ for a JWT.
 *   • No sensitive data stored — the jti is meaningless without the secret.
 *
 * AUTO-CLEANUP via MongoDB TTL index:
 *   The `expiresAt` field drives a TTL index that tells MongoDB to hard-delete
 *   the document automatically once the token's natural expiry has passed.
 *   This means the blocklist never grows unboundedly — it only ever contains
 *   entries for tokens that are still within their valid lifetime.
 *
 *   MongoDB's TTL thread runs approximately every 60 seconds, so there is a
 *   small window where an expired token's blocklist entry lingers — but that
 *   doesn't matter, because an expired token is already rejected by jwt.verify().
 */

"use strict";

const mongoose = require("mongoose");

const tokenBlocklistSchema = new mongoose.Schema(
  {
    // The unique JWT ID (jti claim) of the invalidated token.
    jti: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },

    // "access" | "refresh" — useful for debugging / auditing, not enforced.
    type: {
      type: String,
      enum: ["access", "refresh"],
    },

    // The user this token belonged to — for audit logs and forced sign-out queries.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },

    // When the token itself expires. MongoDB TTL index will delete this
    // document at approximately this time, keeping the collection lean.
    expiresAt: {
      type:     Date,
      required: true,
    },
  },
  {
    // createdAt is useful for audit; updatedAt not needed.
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// TTL index — MongoDB deletes the document when Date.now() >= expiresAt.
// expireAfterSeconds: 0 means "delete exactly at expiresAt" (no extra delay).
tokenBlocklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TokenBlocklist = mongoose.model("TokenBlocklist", tokenBlocklistSchema);

module.exports = TokenBlocklist;
