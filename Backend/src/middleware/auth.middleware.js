// /**
//  * authMiddleware.js  —  Updated to use versioned JWT verification.
//  *
//  * Drop-in replacement for your existing auth middleware.
//  * The only change from before: `jwt.verify(token, process.env.JWT_SECRET)`
//  * is replaced with `jwtUtils.verifyAccessToken(token)`.
//  */

// const jwt = require("jsonwebtoken");
// const { verifyAccessToken } = require("../utils/jwt");

// const protect = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({
//       success: false,
//       message: "Access denied. No token provided.",
//     });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = verifyAccessToken(token);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     if (error instanceof jwt.TokenExpiredError) {
//       return res.status(401).json({
//         success: false,
//         message: "Token expired.",
//         code: "TOKEN_EXPIRED",
//       });
//     }
//     if (error instanceof jwt.JsonWebTokenError) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token.",
//         code: "TOKEN_INVALID",
//       });
//     }
//     // Unknown kid (rotated and pruned) — force re-login
//     return res.status(401).json({
//       success: false,
//       message: "Token is no longer valid. Please log in again.",
//       code: "TOKEN_KEY_RETIRED",
//     });
//   }
// };

// module.exports = { protect };

/**
 * authMiddleware.js  — Updated to expose req.tokenPayload
 *
 * The only change from the previous version:
 *   req.tokenPayload = decoded
 *
 * This makes the full decoded payload (including jti and iat) available to
 * checkBlocklist middleware without re-decoding the token.
 */

"use strict";

const jwt = require("jsonwebtoken");
const { verifyAccessToken } = require("../utils/jwt");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user         = decoded;          // existing — controllers use req.user.id
    req.tokenPayload = decoded;          // new — checkBlocklist uses jti + iat
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token expired.",
        code:    "TOKEN_EXPIRED",
      });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
        code:    "TOKEN_INVALID",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Token is no longer valid. Please log in again.",
      code:    "TOKEN_KEY_RETIRED",
    });
  }
};

module.exports = { protect };