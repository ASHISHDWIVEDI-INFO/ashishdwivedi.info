#!/usr/bin/env node
/**
 * seedAdmin.js — Safe, credential-free admin seeder.
 *
 * WHAT CHANGED FROM THE OLD VERSION
 * ──────────────────────────────────
 * OLD: Read ADMIN_EMAIL + ADMIN_PASSWORD from .env
 *      → credentials sat in plaintext in .env and CI/CD secrets indefinitely.
 *
 * NEW: Takes email as a CLI argument.
 *      Generates a cryptographically random temporary password.
 *      Prints it ONCE to stdout, then it's gone — never stored anywhere.
 *      Sets mustChangePassword: true so the first login forces a real password.
 *
 * USAGE
 * ─────
 *   node scripts/seedAdmin.js --email admin@yourdomain.com
 *
 *   # If you need to re-seed (e.g. locked out) — requires explicit --reset flag:
 *   node scripts/seedAdmin.js --email admin@yourdomain.com --reset
 *
 * WHAT HAPPENS ON FIRST LOGIN
 * ───────────────────────────
 *   1. Log in with the printed temp password.
 *   2. Every API call returns 403 MUST_CHANGE_PASSWORD until you POST to
 *      /api/auth/change-password with { currentPassword, newPassword }.
 *   3. mustChangePassword flag is cleared — normal access resumes.
 *
 * NEVER add ADMIN_EMAIL or ADMIN_PASSWORD back to .env or CI/CD secrets.
 */

"use strict";

const path   = require("path");
const crypto = require("crypto");

// Load .env from Backend directory (adjust path if your structure differs)
require("dotenv").config({ path: path.resolve(__dirname, "../Backend/.env") });

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

// ── Inline the minimal User schema so this script has no circular import risk.
// If your User model file is importable without side effects, you can replace
// this with: const User = require("../Backend/src/models/User.model");
const userSchema = new mongoose.Schema({
  email:              { type: String, required: true, unique: true, lowercase: true },
  password:           { type: String, required: true },
  role:               { type: String, default: "admin" },
  mustChangePassword: { type: Boolean, default: false },
  createdAt:          { type: Date, default: Date.now },
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseArgs() {
  const args  = process.argv.slice(2);
  const email = args[args.indexOf("--email") + 1];
  const reset = args.includes("--reset");
  return { email, reset };
}

/**
 * Generates a temporary password that satisfies common complexity requirements:
 *   • 20 characters
 *   • at least one uppercase, one lowercase, one digit, one symbol
 *
 * It is printed to stdout ONCE and never persisted anywhere.
 */
function generateTempPassword() {
  const upper   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower   = "abcdefghijklmnopqrstuvwxyz";
  const digits  = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{}|;:,.<>?";
  const all     = upper + lower + digits + symbols;

  // Guarantee at least one of each character class.
  const guaranteed = [
    upper  [crypto.randomInt(upper.length)],
    lower  [crypto.randomInt(lower.length)],
    digits [crypto.randomInt(digits.length)],
    symbols[crypto.randomInt(symbols.length)],
  ];

  // Fill the remaining 16 characters from the full set.
  const rest = Array.from({ length: 16 }, () => all[crypto.randomInt(all.length)]);

  // Shuffle to avoid predictable positions.
  return [...guaranteed, ...rest]
    .map((c, i) => ({ c, sort: crypto.randomInt(1000) }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ c }) => c)
    .join("");
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { email, reset } = parseArgs();

  // ── Validate input ────────────────────────────────────────────────────────
  if (!email) {
    console.error("❌  Usage: node scripts/seedAdmin.js --email admin@yourdomain.com [--reset]");
    process.exit(1);
  }
  if (!validateEmail(email)) {
    console.error(`❌  Invalid email address: "${email}"`);
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error("❌  MONGODB_URI is not set. Check your .env file.");
    process.exit(1);
  }

  // ── Connect ───────────────────────────────────────────────────────────────
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected.\n");

  // ── Idempotency check ────────────────────────────────────────────────────
  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing && !reset) {
    console.error(
      `❌  An admin with email "${email}" already exists.\n` +
      `   To reset credentials, re-run with the --reset flag:\n\n` +
      `   node scripts/seedAdmin.js --email ${email} --reset\n`
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  if (existing && reset) {
    console.warn(
      "⚠️   --reset flag detected. Overwriting existing admin credentials.\n" +
      "   All current sessions for this account will be invalidated on next\n" +
      "   token rotation (or immediately if you are using a token blocklist).\n"
    );
  }

  // ── Generate temp password ────────────────────────────────────────────────
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  // ── Save to DB ───────────────────────────────────────────────────────────
  if (existing) {
    existing.password           = hashedPassword;
    existing.mustChangePassword = true;
    await existing.save();
    console.log(`✅  Admin credentials reset for: ${email}`);
  } else {
    await User.create({
      email:              email.toLowerCase(),
      password:           hashedPassword,
      role:               "admin",
      mustChangePassword: true,
    });
    console.log(`✅  Admin account created for: ${email}`);
  }

  // ── Print credentials — the ONLY time this password will ever be visible ──
  console.log("\n" + "─".repeat(60));
  console.log("  TEMPORARY PASSWORD (shown once — copy it now)");
  console.log("─".repeat(60));
  console.log(`  Email    : ${email}`);
  console.log(`  Password : ${tempPassword}`);
  console.log("─".repeat(60));
  console.log("\n  ⚠️  You will be required to change this password on first login.");
  console.log("  ⚠️  Do NOT add this password to .env, CI/CD secrets, or docs.\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
