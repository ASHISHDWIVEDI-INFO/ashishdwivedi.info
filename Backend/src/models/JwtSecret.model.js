const mongoose = require("mongoose");

/**
 * JwtSecret — one document per active/retired signing secret.
 *
 * Fields
 * ──────
 * kid        Unique key-ID embedded in every token header signed with this secret.
 *            Used on verification to look up the right secret without trying all of them.
 *
 * type       "access" | "refresh" — keeps access and refresh key families separate.
 *
 * secret     The HMAC secret value (stored as a string; 64 hex chars = 256-bit entropy).
 *            In a higher-security environment you would encrypt this at rest using a KMS
 *            envelope key before storing, and decrypt on load.
 *
 * isActive   true  → this key is the CURRENT signing key for its type.
 *            false → retired; tokens signed with it are still valid until they expire,
 *                    but no new tokens are issued with it.
 *            Only ONE document per type should have isActive=true at any time.
 *            The pre-save hook below enforces this.
 *
 * retiredAt  Set when the key is rotated out.  A cleanup job can hard-delete documents
 *            whose retiredAt + maxTokenTTL has passed (safe to remove once no live token
 *            can reference this kid).
 *
 * createdAt  Standard timestamp.
 */
const jwtSecretSchema = new mongoose.Schema(
  {
    kid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["access", "refresh"],
      required: true,
    },
    secret: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    retiredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index: quickly find the single active key for a given type.
jwtSecretSchema.index({ type: 1, isActive: 1 });

const JwtSecret = mongoose.model("JwtSecret", jwtSecretSchema);

module.exports = JwtSecret;
