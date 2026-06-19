/**
 * User.model.patch.js
 * ───────────────────
 * This is NOT a standalone file — it shows the diff to apply to your
 * existing User.model.js (or Admin.model.js, however it's named).
 *
 * ADD one field to your existing Mongoose schema:
 *
 * ─────────────────────────────────────────────
 * BEFORE (somewhere in your schema definition):
 * ─────────────────────────────────────────────
 *
 *   const userSchema = new mongoose.Schema({
 *     email:    { type: String, required: true, unique: true },
 *     password: { type: String, required: true },
 *     // ... other fields
 *   }, { timestamps: true });
 *
 * ────────────────────────────────────────────
 * AFTER — add mustChangePassword:
 * ────────────────────────────────────────────
 *
 *   const userSchema = new mongoose.Schema({
 *     email:    { type: String, required: true, unique: true },
 *     password: { type: String, required: true },
 *
 *     // Set to true on seed. Cleared only after a successful /auth/change-password.
 *     // While true, requirePasswordChange middleware blocks all routes except
 *     // /api/auth/change-password and /api/auth/logout.
 *     mustChangePassword: { type: Boolean, default: false },
 *
 *     // ... other fields
 *   }, { timestamps: true });
 *
 * That's the only model change needed. No migration required — MongoDB will
 * return `undefined` for the field on existing documents, which the middleware
 * treats as false (no forced change).
 */