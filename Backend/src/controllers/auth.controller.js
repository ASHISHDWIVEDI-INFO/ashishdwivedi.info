// const jwt = require('jsonwebtoken');
// const { validationResult } = require('express-validator');
// const User = require('../models/user.model');

// // ========================
// // Token Generator Helpers
// // ========================
// const signAccessToken = (userId) =>
//   jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN || '7d',
//   });

// const signRefreshToken = (userId) =>
//   jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
//     expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
//   });

// const sendTokenResponse = (user, statusCode, res) => {
//   const accessToken = signAccessToken(user._id);
//   const refreshToken = signRefreshToken(user._id);

//   res.status(statusCode).json({
//     success: true,
//     accessToken,
//     refreshToken,
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       lastLogin: user.lastLogin,
//     },
//   });
// };

// // ========================
// // @POST /api/auth/login
// // @desc  Admin login
// // @access Public
// // ========================
// exports.login = async (req, res) => {
//   try {
//     // Validate request body
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: errors.array()[0].msg,
//         errors: errors.array(),
//       });
//     }

//     const { email, password } = req.body;

//     // Find user (include password field)
//     const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password.',
//       });
//     }

//     // Check if account is locked
//     if (user.isLocked) {
//       const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
//       return res.status(423).json({
//         success: false,
//         message: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
//         code: 'ACCOUNT_LOCKED',
//       });
//     }

//     // Verify password
//     const isMatch = await user.comparePassword(password);

//     if (!isMatch) {
//       await user.incrementLoginAttempts();
//       const remaining = Math.max(0, 5 - (user.loginAttempts + 1));
//       return res.status(401).json({
//         success: false,
//         message:
//           remaining > 0
//             ? `Invalid email or password. ${remaining} attempt(s) remaining.`
//             : 'Account locked due to too many failed attempts.',
//       });
//     }

//     // Reset login attempts and update lastLogin
//     await user.resetLoginAttempts();

//     // Send token response
//     sendTokenResponse(user, 200, res);
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ success: false, message: 'Server error during login.' });
//   }
// };

// // ========================
// // @POST /api/auth/logout
// // @desc  Admin logout (client-side token removal)
// // @access Private
// // ========================
// exports.logout = async (req, res) => {
//   try {
//     res.status(200).json({
//       success: true,
//       message: 'Logged out successfully.',
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Server error during logout.' });
//   }
// };

// // ========================
// // @POST /api/auth/refresh
// // @desc  Refresh access token using refresh token
// // @access Public
// // ========================
// exports.refresh = async (req, res) => {
//   try {
//     const { refreshToken } = req.body;

//     if (!refreshToken) {
//       return res.status(401).json({
//         success: false,
//         message: 'Refresh token is required.',
//       });
//     }

//     // Verify refresh token
//     let decoded;
//     try {
//       decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
//     } catch (err) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid or expired refresh token. Please login again.',
//         code: 'REFRESH_TOKEN_INVALID',
//       });
//     }

//     // Check user exists
//     const user = await User.findById(decoded.id);
//     if (!user || !user.isActive) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not found or account deactivated.',
//       });
//     }

//     // Issue new access token only
//     const accessToken = signAccessToken(user._id);

//     res.status(200).json({
//       success: true,
//       accessToken,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     console.error('Refresh error:', error);
//     res.status(500).json({ success: false, message: 'Server error during token refresh.' });
//   }
// };

// // ========================
// // @PUT /api/auth/change-password
// // @desc  Change admin password
// // @access Private
// // ========================
// exports.changePassword = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: errors.array()[0].msg,
//       });
//     }

//     const { currentPassword, newPassword } = req.body;

//     // Get user with password field
//     const user = await User.findById(req.user._id).select('+password');

//     // Verify current password
//     const isMatch = await user.comparePassword(currentPassword);
//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: 'Current password is incorrect.',
//       });
//     }

//     // Prevent reuse of same password
//     const isSame = await user.comparePassword(newPassword);
//     if (isSame) {
//       return res.status(400).json({
//         success: false,
//         message: 'New password must be different from the current password.',
//       });
//     }

//     // Update password (pre-save hook handles hashing)
//     user.password = newPassword;
//     await user.save();

//     // Issue new tokens (old ones invalidated by passwordChangedAt)
//     sendTokenResponse(user, 200, res);
//   } catch (error) {
//     console.error('Change password error:', error);
//     res.status(500).json({ success: false, message: 'Server error changing password.' });
//   }
// };

// // ========================
// // @GET /api/auth/me
// // @desc  Get current logged-in admin
// // @access Private
// // ========================
// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     res.status(200).json({
//       success: true,
//       user,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Server error.' });
//   }
// };

/**
 * auth.controller.js  — Logout + Refresh updated for real token invalidation.
 *
 * CHANGES
 * ───────
 * logout()  — now blocks both the access token AND the refresh token jti.
 * refresh() — verifies the refresh token is not blocked before issuing new tokens,
 *             then blocks the old refresh token (single-use rotation).
 * 
 * The login() function also changes slightly — signAccessToken and signRefreshToken
 * now return { token, jti } instead of a plain string. See login() below.
 *
 * Copy the relevant functions into your existing auth.controller.js.
 */

"use strict";

const bcrypt = require("bcryptjs");
const User   = require("../models/User.model");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  blockToken,
  blockAllTokensForUser,
  isTokenBlocked,
  ACCESS_TTL_MS,
  REFRESH_TTL_MS,
} = require("../utils/jwt");

// ── Login ────────────────────────────────────────────────────────────────────
// signAccessToken / signRefreshToken now return { token, jti } — update login.

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("password role");
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials." });
  }

  // Destructure { token, jti } — jti stored in httpOnly cookie or returned
  // to client so the refresh endpoint can reference it. Most commonly the
  // refresh token is sent as an httpOnly cookie; the access token in the body.
  const { token: accessToken }  = signAccessToken({ id: user._id, role: user.role });
  const { token: refreshToken } = signRefreshToken({ id: user._id });

  // If you use httpOnly cookies for the refresh token:
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   REFRESH_TTL_MS,
  });

  return res.status(200).json({
    success: true,
    accessToken,
  });
}

// ── Logout ───────────────────────────────────────────────────────────────────
// Blocks BOTH the access token AND the refresh token so neither can be reused.

async function logout(req, res) {
  // Access token — jti is on req.tokenPayload (set by protect middleware).
  const { jti: accessJti, id: userId, exp: accessExp } = req.tokenPayload;

  await blockToken({
    jti:       accessJti,
    type:      "access",
    userId,
    expiresAt: new Date(accessExp * 1000),   // exp is Unix seconds
  });

  // Refresh token — read from httpOnly cookie (or req.body.refreshToken if you
  // send it in the request body instead).
  const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (rawRefreshToken) {
    try {
      const refreshPayload = verifyRefreshToken(rawRefreshToken);
      await blockToken({
        jti:       refreshPayload.jti,
        type:      "refresh",
        userId,
        expiresAt: new Date(refreshPayload.exp * 1000),
      });
    } catch {
      // Refresh token is already expired or invalid — nothing to block.
    }
  }

  // Clear the refresh cookie.
  res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "strict" });

  return res.status(200).json({ success: true, message: "Logged out successfully." });
}

// ── Refresh ──────────────────────────────────────────────────────────────────
// Implements single-use refresh token rotation:
//   1. Verify the refresh token.
//   2. Check it isn't blocked.
//   3. Block it immediately (one-time use).
//   4. Issue a new access token + new refresh token.

async function refresh(req, res) {
  const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!rawRefreshToken) {
    return res.status(401).json({ success: false, message: "No refresh token provided." });
  }

  let refreshPayload;
  try {
    refreshPayload = verifyRefreshToken(rawRefreshToken);
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token." });
  }

  // Check blocklist.
  const blocked = await isTokenBlocked(refreshPayload);
  if (blocked) {
    // A blocked refresh token being replayed is a strong signal of token theft.
    // Block all tokens for this user as a precaution.
    await blockAllTokensForUser(refreshPayload.id);
    return res.status(401).json({
      success: false,
      code:    "TOKEN_REUSE_DETECTED",
      message: "Refresh token has already been used. All sessions have been invalidated for your security.",
    });
  }

  // Block the used refresh token immediately (single-use rotation).
  await blockToken({
    jti:       refreshPayload.jti,
    type:      "refresh",
    userId:    refreshPayload.id,
    expiresAt: new Date(refreshPayload.exp * 1000),
  });

  // Issue fresh tokens.
  const user = await User.findById(refreshPayload.id).select("role");
  if (!user) {
    return res.status(401).json({ success: false, message: "User not found." });
  }

  const { token: newAccessToken }  = signAccessToken({ id: user._id, role: user.role });
  const { token: newRefreshToken } = signRefreshToken({ id: user._id });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   REFRESH_TTL_MS,
  });

  return res.status(200).json({ success: true, accessToken: newAccessToken });
}

module.exports = { login, logout, refresh };