// ##1 
// /**
//  * jwt.js  —  Drop-in replacement for the original jwt.js helper.
//  *
//  * BEFORE (original):
//  *   jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" })
//  *   jwt.verify(token, process.env.JWT_SECRET)
//  *
//  * AFTER (this file):
//  *   jwtUtils.signAccessToken(payload)
//  *   jwtUtils.signRefreshToken(payload)
//  *   jwtUtils.verifyAccessToken(token)
//  *   jwtUtils.verifyRefreshToken(token)
//  *
//  * The active signing key is fetched from jwtSecretManager (in-memory cache backed
//  * by MongoDB). The kid is embedded in the JWT header so verification can look up
//  * the exact secret without trying all of them.
//  */

// const jwt = require("jsonwebtoken");
// const jwtSecretManager = require("./jwtSecretManager");

// // ── Token lifetimes ─────────────────────────────────────────────────────────
// // Adjust to match your current .env values if they differ.
// const ACCESS_TOKEN_TTL  = process.env.JWT_ACCESS_EXPIRES_IN  || "15m";
// const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

// // ── Sign ─────────────────────────────────────────────────────────────────────

// /**
//  * Sign a new access token.
//  * @param {object} payload  — e.g. { id: user._id, role: "admin" }
//  * @returns {string} signed JWT
//  */
// function signAccessToken(payload) {
//   const { kid, secret } = jwtSecretManager.getActiveKey("access");
//   return jwt.sign(payload, secret, {
//     expiresIn: ACCESS_TOKEN_TTL,
//     keyid: kid,          // stored in JWT header as "kid"
//     algorithm: "HS256",
//   });
// }

// /**
//  * Sign a new refresh token.
//  * @param {object} payload  — e.g. { id: user._id }
//  * @returns {string} signed JWT
//  */
// function signRefreshToken(payload) {
//   const { kid, secret } = jwtSecretManager.getActiveKey("refresh");
//   return jwt.sign(payload, secret, {
//     expiresIn: REFRESH_TOKEN_TTL,
//     keyid: kid,
//     algorithm: "HS256",
//   });
// }

// // ── Verify ───────────────────────────────────────────────────────────────────

// /**
//  * Verify an access token.
//  * Reads the `kid` from the token header, fetches the matching secret, and verifies.
//  *
//  * @param {string} token
//  * @returns {object} decoded payload
//  * @throws {JsonWebTokenError | TokenExpiredError | Error}
//  */
// function verifyAccessToken(token) {
//   return _verify(token, "access");
// }

// /**
//  * Verify a refresh token.
//  *
//  * @param {string} token
//  * @returns {object} decoded payload
//  * @throws {JsonWebTokenError | TokenExpiredError | Error}
//  */
// function verifyRefreshToken(token) {
//   return _verify(token, "refresh");
// }

// // ── Internal ─────────────────────────────────────────────────────────────────

// /**
//  * Decode the header to get kid, look up the secret, then fully verify.
//  *
//  * We decode the header WITHOUT verifying the signature first.
//  * This is safe because we only use the kid to SELECT the secret —
//  * the actual cryptographic verification happens right after with the full jwt.verify().
//  */
// function _verify(token, expectedType) {
//   // Step 1: decode header to read kid (no signature check yet).
//   const decoded = jwt.decode(token, { complete: true });
//   if (!decoded || !decoded.header?.kid) {
//     throw new jwt.JsonWebTokenError("Token missing kid in header. It may have been issued before secret rotation was deployed.");
//   }

//   const kid = decoded.header.kid;

//   // Step 2: Validate kid belongs to the expected token family.
//   // kid format: "access-<timestamp>-<hex>" or "refresh-<timestamp>-<hex>"
//   if (!kid.startsWith(expectedType + "-")) {
//     throw new jwt.JsonWebTokenError(`Token kid type mismatch: expected "${expectedType}" key.`);
//   }

//   // Step 3: Fetch the secret for this kid.
//   const secret = jwtSecretManager.getSecretByKid(kid);

//   // Step 4: Full cryptographic verification.
//   return jwt.verify(token, secret, { algorithms: ["HS256"] });
// }

// module.exports = {
//   signAccessToken,
//   signRefreshToken,
//   verifyAccessToken,
//   verifyRefreshToken,
// };

/**
 * jwt.js  — Updated to embed a jti (JWT ID) in every token.
 *
 * CHANGES FROM PREVIOUS VERSION
 * ──────────────────────────────
 * • signAccessToken()  and signRefreshToken() now include a `jti` (uuid v4).
 * • Added blockToken(jti, type, userId, expiresAt) — writes to TokenBlocklist.
 * • Added blockTokensForUser(userId) — invalidates ALL tokens for a user
 *   (useful for "sign out everywhere" or forced logout after password change).
 * • verifyAccessToken() / verifyRefreshToken() are UNCHANGED — blocklist check
 *   is done separately in checkBlocklist middleware so it stays composable.
 *
 * jti format: uuid v4 (e.g. "550e8400-e29b-41d4-a716-446655440000")
 * It is embedded in the JWT payload as the standard `jti` claim.
 */

// ##2

"use strict";

const jwt            = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const TokenBlocklist = require("../models/TokenBlocklist.model");
const jwtSecretManager = require("./jwtSecretManager"); // from the previous JWT rotation fix

// ── Token lifetimes ──────────────────────────────────────────────────────────
const ACCESS_TOKEN_TTL    = process.env.JWT_ACCESS_EXPIRES_IN  || "15m";
const REFRESH_TOKEN_TTL   = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

// Pre-computed as milliseconds for expiresAt Date calculations.
const ACCESS_TTL_MS  = parseTTLtoMs(ACCESS_TOKEN_TTL);
const REFRESH_TTL_MS = parseTTLtoMs(REFRESH_TOKEN_TTL);

// ── Sign ─────────────────────────────────────────────────────────────────────

/**
 * Sign a new access token with a unique jti.
 * @param {object} payload  e.g. { id: user._id, role: "admin" }
 * @returns {{ token: string, jti: string }}
 */
function signAccessToken(payload) {
  const jti = uuidv4();
  const { kid, secret } = jwtSecretManager.getActiveKey("access");
  const token = jwt.sign(
    { ...payload, jti },
    secret,
    { expiresIn: ACCESS_TOKEN_TTL, keyid: kid, algorithm: "HS256" }
  );
  return { token, jti };
}

/**
 * Sign a new refresh token with a unique jti.
 * @param {object} payload  e.g. { id: user._id }
 * @returns {{ token: string, jti: string }}
 */
function signRefreshToken(payload) {
  const jti = uuidv4();
  const { kid, secret } = jwtSecretManager.getActiveKey("refresh");
  const token = jwt.sign(
    { ...payload, jti },
    secret,
    { expiresIn: REFRESH_TOKEN_TTL, keyid: kid, algorithm: "HS256" }
  );
  return { token, jti };
}

// ── Verify ───────────────────────────────────────────────────────────────────

/**
 * Verify an access token. Returns decoded payload (includes jti).
 * Blocklist check is done separately in checkBlocklist middleware.
 */
function verifyAccessToken(token) {
  return _verify(token, "access");
}

/**
 * Verify a refresh token. Returns decoded payload (includes jti).
 */
function verifyRefreshToken(token) {
  return _verify(token, "refresh");
}

// ── Blocklist helpers ────────────────────────────────────────────────────────

/**
 * Add a single token's jti to the blocklist.
 *
 * @param {object} opts
 * @param {string} opts.jti       - The jti claim from the token payload
 * @param {"access"|"refresh"} opts.type
 * @param {string} opts.userId    - The user._id this token belonged to
 * @param {Date}   opts.expiresAt - When the token naturally expires (for TTL cleanup)
 */
async function blockToken({ jti, type, userId, expiresAt }) {
  // Upsert: if already blocked (e.g. double-logout), silently succeed.
  await TokenBlocklist.updateOne(
    { jti },
    { $setOnInsert: { jti, type, userId, expiresAt } },
    { upsert: true }
  );
}

/**
 * Invalidate ALL active tokens for a user.
 * Use this on:
 *   • Password change (someone may have a stolen token)
 *   • "Sign out everywhere" feature
 *   • Admin forced-logout
 *
 * Since we don't store issued tokens server-side, we can't enumerate every jti.
 * Instead, we write a single sentinel document keyed by userId that checkBlocklist
 * also queries. Any token issued BEFORE this sentinel's createdAt is rejected.
 *
 * @param {string} userId
 */
async function blockAllTokensForUser(userId) {
  // Sentinel document — expires after the longest possible token lifetime.
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  await TokenBlocklist.updateOne(
    { jti: `user-sentinel:${userId}` },
    {
      $set: {
        jti:       `user-sentinel:${userId}`,
        type:      "sentinel",
        userId,
        expiresAt,
      },
    },
    { upsert: true }
  );
}

/**
 * Check if a decoded token payload is blocked.
 * Called by checkBlocklist middleware — exposed here so it can also be
 * called directly in the refresh endpoint.
 *
 * @param {object} decoded  - The verified JWT payload ({ jti, id, iat, ... })
 * @returns {Promise<boolean>}  true if the token should be rejected
 */
async function isTokenBlocked(decoded) {
  const { jti, id: userId, iat } = decoded;

  // 1. Check if this specific jti is blocked.
  const blocked = await TokenBlocklist.exists({ jti });
  if (blocked) return true;

  // 2. Check if there's a user-level sentinel issued AFTER this token was signed.
  //    (iat is Unix seconds; sentinel.createdAt is a Date)
  const sentinel = await TokenBlocklist
    .findOne({ jti: `user-sentinel:${userId}` })
    .select("createdAt")
    .lean();

  if (sentinel) {
    const sentinelIssuedAt = Math.floor(sentinel.createdAt.getTime() / 1000);
    // If the sentinel was created after this token was issued → reject.
    if (sentinelIssuedAt > iat) return true;
  }

  return false;
}

// ── Internal ─────────────────────────────────────────────────────────────────

function _verify(token, expectedType) {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded?.header?.kid) {
    throw new jwt.JsonWebTokenError("Token missing kid in header.");
  }
  const kid = decoded.header.kid;
  if (!kid.startsWith(expectedType + "-")) {
    throw new jwt.JsonWebTokenError(`Token kid type mismatch: expected "${expectedType}" key.`);
  }
  const secret = jwtSecretManager.getSecretByKid(kid);
  return jwt.verify(token, secret, { algorithms: ["HS256"] });
}

/** Parse "15m", "7d", "30d" → milliseconds */
function parseTTLtoMs(ttl) {
  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const match = String(ttl).match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid TTL format: "${ttl}"`);
  return parseInt(match[1], 10) * units[match[2]];
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  blockToken,
  blockAllTokensForUser,
  isTokenBlocked,
  ACCESS_TTL_MS,
  REFRESH_TTL_MS,
};