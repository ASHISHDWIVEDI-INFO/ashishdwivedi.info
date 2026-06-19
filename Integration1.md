# Token Blocklist — Integration Guide

## Files added / changed

```
Backend/src/models/TokenBlocklist.model.js   ← new Mongoose model (auto-TTL)
Backend/src/utils/jwt.js                     ← adds jti to tokens + blocklist helpers
Backend/src/middleware/checkBlocklist.js     ← new middleware — rejects revoked tokens
Backend/src/middleware/authMiddleware.js     ← adds req.tokenPayload (minor patch)
Backend/src/controllers/auth.controller.js  ← real logout + refresh token rotation
```

---

## 1. Add `uuid` dependency

```bash
npm install uuid
```

---

## 2. Register the model in your model index

```js
// models/index.js  (or wherever you aggregate models)
require("./TokenBlocklist.model");
```

---

## 3. Add `checkBlocklist` after `protect` in your router

```js
const { protect }    = require("./middleware/authMiddleware");
const checkBlocklist = require("./middleware/checkBlocklist");

// Apply globally to every protected route — one line:
app.use("/api", protect, checkBlocklist, apiRouter);
```

`checkBlocklist` does nothing on unauthenticated routes (no `req.tokenPayload`),
so it's safe to mount globally.

---

## 4. Update auth routes

```js
const { login, logout, refresh } = require("./controllers/auth.controller");

router.post("/auth/login",   login);
router.post("/auth/logout",  protect, checkBlocklist, logout);  // protect first
router.post("/auth/refresh", refresh);                          // no protect — uses refresh token
```

---

## 5. Cookie parser (if using httpOnly cookies for refresh token)

```bash
npm install cookie-parser
```

```js
// app.js
const cookieParser = require("cookie-parser");
app.use(cookieParser());
```

---

## How it all fits together

```
LOGIN
  signAccessToken()  → { token, jti: "abc-123" }   jti embedded in payload
  signRefreshToken() → { token, jti: "def-456" }
  refreshToken set as httpOnly cookie

REQUEST
  protect middleware    → verifies signature, sets req.tokenPayload = { jti, id, iat, exp }
  checkBlocklist        → TokenBlocklist.exists({ jti: "abc-123" }) → false → allowed

LOGOUT
  blockToken({ jti: "abc-123", type: "access",  expiresAt: ... })
  blockToken({ jti: "def-456", type: "refresh", expiresAt: ... })
  clearCookie("refreshToken")

SUBSEQUENT REQUEST with same token
  protect → OK (signature still valid)
  checkBlocklist → TokenBlocklist.exists({ jti: "abc-123" }) → TRUE → 401 TOKEN_REVOKED

AUTO-CLEANUP
  MongoDB TTL index deletes TokenBlocklist docs when expiresAt passes.
  The blocklist never grows beyond the number of currently-valid-but-revoked tokens.
```

---

## Bonus: "Sign out everywhere" (block all user tokens)

Useful after a password change or suspected compromise:

```js
const { blockAllTokensForUser } = require("../utils/jwt");

// In your changePassword controller (already wired in the seed fix):
await blockAllTokensForUser(req.user.id);
```

This writes a sentinel document. `checkBlocklist` rejects any token whose
`iat` (issued-at) is earlier than the sentinel's `createdAt`.