#!/usr/bin/env node
/**
 * rotateJwtSecret.js
 * ──────────────────
 * CLI script to rotate JWT signing secrets without restarting the server.
 *
 * Usage
 * ─────
 *   # Rotate the access token key
 *   node scripts/rotateJwtSecret.js --type access
 *
 *   # Rotate the refresh token key
 *   node scripts/rotateJwtSecret.js --type refresh
 *
 *   # Rotate both at once
 *   node scripts/rotateJwtSecret.js --type both
 *
 *   # Rotate + prune old keys immediately (useful after a forced logout of all users)
 *   node scripts/rotateJwtSecret.js --type both --prune
 *
 * What happens
 * ────────────
 * 1. Connects to MongoDB using MONGODB_URI from .env.
 * 2. Calls jwtSecretManager.init() to load current keys.
 * 3. Calls jwtSecretManager.rotate(type) which:
 *    - Generates a new 256-bit secret + unique kid.
 *    - Saves it to MongoDB as active.
 *    - Marks the old key as retired (NOT deleted — live tokens still need it).
 * 4. Optionally prunes fully expired old keys (--prune flag).
 * 5. Exits.
 *
 * After running this script, all NEW tokens use the fresh secret.
 * Existing tokens signed with the old secret continue to verify until they expire.
 *
 * For zero-downtime rotation:
 *   - Rotate the access key. Access tokens expire in 15m, so within 15 minutes
 *     all active sessions will have refreshed to a new access token.
 *   - Rotate the refresh key. Refresh tokens expire in 30 days, so after 30 days
 *     ALL tokens from the old key are gone. Run --prune after 30 days to clean up.
 *
 * Scheduling
 * ──────────
 * Add to crontab for periodic rotation, e.g. monthly:
 *   0 3 1 * *  node /path/to/app/scripts/rotateJwtSecret.js --type both >> /var/log/jwt-rotation.log 2>&1
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const jwtSecretManager = require("../Backend/src/utils/jwtSecretManager");

// Max token ages (must match your JWT_ACCESS_EXPIRES_IN / JWT_REFRESH_EXPIRES_IN)
const ACCESS_MAX_AGE_MS  = 15 * 60 * 1000;           // 15 minutes
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function main() {
  const args = process.argv.slice(2);
  const typeArg = args[args.indexOf("--type") + 1];
  const shouldPrune = args.includes("--prune");

  if (!typeArg || !["access", "refresh", "both"].includes(typeArg)) {
    console.error('Usage: node rotateJwtSecret.js --type <access|refresh|both> [--prune]');
    process.exit(1);
  }

  const typesToRotate = typeArg === "both" ? ["access", "refresh"] : [typeArg];

  // ── Connect ────────────────────────────────────────────────────────────────
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected.");

  // ── Init secret manager ───────────────────────────────────────────────────
  await jwtSecretManager.init();

  // ── Rotate ────────────────────────────────────────────────────────────────
  for (const type of typesToRotate) {
    console.log(`\nRotating ${type} key...`);
    const newKid = await jwtSecretManager.rotate(type);
    console.log(`✓ New active ${type} key: ${newKid}`);
  }

  // ── Prune (optional) ──────────────────────────────────────────────────────
  if (shouldPrune) {
    console.log("\nPruning expired keys...");
    for (const type of typesToRotate) {
      const maxAge = type === "access" ? ACCESS_MAX_AGE_MS : REFRESH_MAX_AGE_MS;
      await jwtSecretManager.pruneExpired(type, maxAge);
    }
    console.log("✓ Prune complete.");
  }

  console.log("\nRotation complete. No server restart required.");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Rotation failed:", err);
  process.exit(1);
});
