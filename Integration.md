# JWT Secret Rotation — Integration Guide

## Files added

```
Backend/src/models/JwtSecret.model.js    ← new Mongoose model
Backend/src/utils/jwtSecretManager.js    ← singleton secret cache
Backend/src/utils/jwt.js                 ← REPLACES your existing jwt.js
Backend/src/middleware/authMiddleware.js ← REPLACES your existing auth middleware
scripts/rotateJwtSecret.js               ← CLI rotation tool
```

---

## 1. Update app.js / server.js — init after DB connects

```js
const mongoose = require("mongoose");
const jwtSecretManager = require("./src/utils/jwtSecretManager");

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // ✅ Add this line — loads/bootstraps secrets into memory
  await jwtSecretManager.init();

  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});
```

---

## 2. Update auth.controller.js

Replace every `jwt.sign` / `jwt.verify` call:

```js
// BEFORE
const jwt = require("jsonwebtoken");
const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });

// AFTER
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const accessToken  = signAccessToken({ id: user._id });
const refreshToken = signRefreshToken({ id: user._id });

// In your /refresh endpoint:
// BEFORE
const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
// AFTER
const decoded = verifyRefreshToken(token);
```

---

## 3. Update .env.example

The `JWT_SECRET` and `JWT_REFRESH_SECRET` variables are **no longer needed** —
secrets are now auto-generated and stored in MongoDB.

Remove:
```
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_here_min_32_chars
```

Add (optional — controls token lifetimes):
```
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
```

---

## 4. Register the JwtSecret model

Make sure Mongoose sees the model before `init()` runs. 
Either import it in `app.js`, or add it to your model index:

```js
// models/index.js  (or wherever you aggregate models)
require("./JwtSecret.model");
```

---

## 5. Rotating secrets

```bash
# Rotate access key only (safe — old tokens still verify for up to 15 min)
node scripts/rotateJwtSecret.js --type access

# Rotate both keys (new tokens use new secrets immediately)
node scripts/rotateJwtSecret.js --type both

# Rotate + prune fully expired old keys
node scripts/rotateJwtSecret.js --type both --prune
```

**Cron example** — rotate monthly, prune the next day:
```cron
0 3 1 * *  node /app/scripts/rotateJwtSecret.js --type both        >> /var/log/jwt-rotate.log 2>&1
0 3 2 * *  node /app/scripts/rotateJwtSecret.js --type both --prune >> /var/log/jwt-rotate.log 2>&1
```

---

## How it works — quick mental model

```
MongoDB: JwtSecret collection
┌──────────────────────────────────────────────────────────────┐
│ kid                        type     isActive  retiredAt       │
│ access-1750000000-a1b2c3d4  access   true      null           │ ← signs new tokens
│ access-1740000000-e5f6a7b8  access   false     2026-05-01     │ ← old; verify only
│ refresh-1750000000-c9d0e1f2 refresh  true      null           │
└──────────────────────────────────────────────────────────────┘

Token header: { "alg": "HS256", "kid": "access-1750000000-a1b2c3d4" }
                                          ↑
                           jwtSecretManager.getSecretByKid(kid)
                           → looks up the secret from the in-memory cache
```

- **Sign**: `getActiveKey(type)` → returns `{ kid, secret }` for the current active key
- **Verify**: read `kid` from token header → `getSecretByKid(kid)` → verify signature
- **Rotate**: new key becomes active, old key stays in cache for verification until pruned
- **Prune**: `pruneExpired(type, maxAgeMs)` removes retired keys older than the max token lifetime
