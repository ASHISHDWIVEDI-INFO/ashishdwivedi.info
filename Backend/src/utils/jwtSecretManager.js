const crypto = require("crypto");
const JwtSecret = require("../models/JwtSecret.model");

/**
 * JwtSecretManager
 * ─────────────────
 * Manages versioned JWT signing secrets for "access" and "refresh" token families.
 *
 * Memory layout
 * ─────────────
 * _cache   Map<kid, { secret, type, isActive }>   — all non-deleted secrets
 * _active  Map<type, kid>                          — current active kid per type
 *
 * Lifecycle
 * ─────────
 * 1. Call `init()` once at application startup (after DB connects).
 *    If no secrets exist yet, bootstrap secrets are auto-created.
 * 2. Call `rotate(type)` any time you want to issue new tokens with a fresh secret.
 *    The old secret stays in _cache so existing tokens continue to verify.
 * 3. Call `pruneExpired(type, maxAgMs)` periodically to hard-delete retired secrets
 *    whose age exceeds the maximum possible token lifetime for that type.
 */
class JwtSecretManager {
  constructor() {
    /** @type {Map<string, {secret:string, type:string, isActive:boolean}>} */
    this._cache = new Map();
    /** @type {Map<string, string>}  type → kid */
    this._active = new Map();
    this._initialized = false;
  }

  // ─── Init ──────────────────────────────────────────────────────────────────

  /**
   * Load all secrets from MongoDB into memory.
   * Must be called once after the DB connection is established.
   */
  async init() {
    const secrets = await JwtSecret.find({}).lean();

    for (const s of secrets) {
      this._cache.set(s.kid, {
        secret: s.secret,
        type: s.type,
        isActive: s.isActive,
      });
      if (s.isActive) {
        this._active.set(s.type, s.kid);
      }
    }

    // Bootstrap: if no active secret exists for a type, create one.
    for (const type of ["access", "refresh"]) {
      if (!this._active.has(type)) {
        console.log(`[jwtSecretManager] No active ${type} key found — bootstrapping.`);
        await this._createAndActivate(type);
      }
    }

    this._initialized = true;
    console.log(
      `[jwtSecretManager] Initialized. Active keys: access=${this._active.get(
        "access"
      )}, refresh=${this._active.get("refresh")}`
    );
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Returns { kid, secret } for the currently active key of `type`.
   * Use this when SIGNING a new token.
   *
   * @param {"access"|"refresh"} type
   * @returns {{ kid: string, secret: string }}
   */
  getActiveKey(type) {
    this._assertInitialized();
    const kid = this._active.get(type);
    if (!kid) throw new Error(`No active JWT key for type "${type}"`);
    const entry = this._cache.get(kid);
    if (!entry) throw new Error(`Active kid "${kid}" not found in cache`);
    return { kid, secret: entry.secret };
  }

  /**
   * Returns the secret string for a given `kid`.
   * Use this when VERIFYING a token (kid is read from the token header).
   *
   * @param {string} kid
   * @returns {string}
   */
  getSecretByKid(kid) {
    this._assertInitialized();
    const entry = this._cache.get(kid);
    if (!entry) {
      throw new Error(`Unknown or expired JWT key id "${kid}". Token may have been issued before last rotation cleanup.`);
    }
    return entry.secret;
  }

  /**
   * Rotate the active key for `type`.
   *
   * Steps:
   *  1. Generate a new 256-bit secret and a new kid.
   *  2. Mark the new key as active in MongoDB (and cache).
   *  3. Mark the old key as retired in MongoDB (but keep it in cache for verification).
   *
   * After rotation, all NEW tokens use the new secret.
   * All EXISTING tokens signed with the old secret continue to verify
   * until they expire naturally.
   *
   * @param {"access"|"refresh"} type
   * @returns {Promise<string>} The new kid
   */
  async rotate(type) {
    this._assertInitialized();

    const oldKid = this._active.get(type);

    // 1. Create and activate the new key.
    const newKid = await this._createAndActivate(type);

    // 2. Retire the old key in MongoDB (keep it in cache).
    if (oldKid) {
      await JwtSecret.updateOne(
        { kid: oldKid },
        { isActive: false, retiredAt: new Date() }
      );
      const oldEntry = this._cache.get(oldKid);
      if (oldEntry) {
        oldEntry.isActive = false;
      }
      console.log(`[jwtSecretManager] Retired ${type} key: ${oldKid}`);
    }

    console.log(`[jwtSecretManager] Rotation complete. New active ${type} key: ${newKid}`);
    return newKid;
  }

  /**
   * Hard-delete retired secrets whose retiredAt is older than `maxAgeMs`.
   * Set maxAgeMs to the maximum token lifetime for that type so you never
   * delete a secret that could still be referenced by a live token.
   *
   * Example: access tokens live 15 min → maxAgeMs = 15 * 60 * 1000
   *          refresh tokens live 30 days → maxAgeMs = 30 * 24 * 60 * 60 * 1000
   *
   * @param {"access"|"refresh"} type
   * @param {number} maxAgeMs
   */
  async pruneExpired(type, maxAgeMs) {
    const cutoff = new Date(Date.now() - maxAgeMs);
    const result = await JwtSecret.deleteMany({
      type,
      isActive: false,
      retiredAt: { $lte: cutoff },
    });

    // Evict from cache too.
    for (const [kid, entry] of this._cache.entries()) {
      if (entry.type === type && !entry.isActive) {
        this._cache.delete(kid);
      }
    }

    if (result.deletedCount > 0) {
      console.log(
        `[jwtSecretManager] Pruned ${result.deletedCount} expired ${type} key(s).`
      );
    }
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  /**
   * Generates a new secret + kid, saves to MongoDB, activates in cache.
   * Does NOT retire the previous key — the caller is responsible for that.
   */
  async _createAndActivate(type) {
    // kid = type prefix + timestamp + 4 random bytes → human-readable, unique
    const kid = `${type}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    // 64 hex chars = 32 bytes = 256-bit secret
    const secret = crypto.randomBytes(32).toString("hex");

    await JwtSecret.create({ kid, type, secret, isActive: true });

    this._cache.set(kid, { secret, type, isActive: true });
    this._active.set(type, kid);

    return kid;
  }

  _assertInitialized() {
    if (!this._initialized) {
      throw new Error("JwtSecretManager has not been initialized. Call init() after DB connects.");
    }
  }
}

// Export a singleton so the whole app shares one cache.
const jwtSecretManager = new JwtSecretManager();
module.exports = jwtSecretManager;