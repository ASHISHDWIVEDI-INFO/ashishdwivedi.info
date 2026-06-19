/**
 * helmetConfig.js
 * ────────────────
 * Explicit Helmet configuration for every security header.
 *
 * WHY EXPLICIT OVER DEFAULT?
 * ──────────────────────────
 * `app.use(helmet())` enables most headers with sensible defaults but:
 *   • CSP is DISABLED by default in Helmet v7+ (breaking change from v6).
 *     Without it, XSS attacks in any HTML response have no browser-level mitigation.
 *   • Other directives use Helmet's defaults which may not match this app's needs.
 *   • Implicit defaults mean future Helmet upgrades can silently change behaviour.
 *
 * This file documents every header and every directive intentionally, so the
 * security posture is always explicit and reviewable.
 *
 * USAGE
 * ─────
 *   const helmetConfig = require("./src/config/helmetConfig");
 *
 *   // Mount before all routes — first middleware in app.js.
 *   app.use(helmetConfig);
 *
 * INSTALL
 * ───────
 *   npm install helmet   (already in package.json)
 */

"use strict";

const helmet = require("helmet");
const env    = require("./env");       // fix #9 — typed env vars

const isProd = env.NODE_ENV === "production";

// ── Content Security Policy ───────────────────────────────────────────────────
//
// This app is a JSON API. It does not serve HTML pages in normal operation.
// The CSP below is therefore intentionally locked down to "nothing allowed"
// as the default, with only what the API actually needs.
//
// If you ever add an admin UI served directly by Express (not Next.js), you
// will need to expand the script-src and style-src directives below.
//
// Directive reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

const cspDirectives = {
  defaultSrc: ["'none'"],          // Block everything not explicitly allowed

  // Scripts — none. The API serves JSON, not HTML with scripts.
  // If Express ever serves the admin panel directly, add: "'self'"
  scriptSrc:  ["'none'"],

  // Styles — none for a pure API.
  styleSrc:   ["'none'"],

  // Images — 'self' only. Allows the /health route to render if ever opened
  // in a browser, and covers any future HTML error pages.
  imgSrc:     ["'self'"],

  // Fonts — none.
  fontSrc:    ["'none'"],

  // Forms — none. API uses JSON bodies, not HTML forms.
  formAction: ["'none'"],

  // Frames — none. API responses should never be framed.
  frameAncestors: ["'none'"],       // Equivalent to X-Frame-Options: DENY

  // Connections — self only. Prevents exfiltration via fetch/XHR in any
  // HTML error pages to arbitrary third-party hosts.
  connectSrc: ["'self'"],

  // Objects / embeds — none.
  objectSrc:  ["'none'"],

  // Media — none.
  mediaSrc:   ["'none'"],

  // Workers / manifests — none.
  workerSrc:  ["'none'"],
  manifestSrc:["'none'"],

  // Base URI — restrict to self so a base tag injection can't redirect
  // relative URLs to an attacker's domain.
  baseUri:    ["'self'"],

  // Upgrade insecure requests in production — forces HTTP → HTTPS for any
  // sub-resources in HTML responses.
  ...(isProd && { upgradeInsecureRequests: [] }),
};

// ── Full Helmet options ───────────────────────────────────────────────────────

const helmetOptions = {

  // ── Content-Security-Policy ─────────────────────────────────────────────────
  contentSecurityPolicy: {
    directives: cspDirectives,
    // reportOnly: true,  // Flip this on during initial rollout to log violations
    //                    // without blocking — then switch to enforcing mode.
  },

  // ── Cross-Origin-Embedder-Policy ────────────────────────────────────────────
  // "require-corp" — prevents the page from loading cross-origin resources
  // that don't explicitly grant permission. Safe for a pure API.
  crossOriginEmbedderPolicy: { policy: "require-corp" },

  // ── Cross-Origin-Opener-Policy ──────────────────────────────────────────────
  // "same-origin" — isolates the browsing context from other origins.
  // Enables SharedArrayBuffer if ever needed, and limits cross-origin leaks.
  crossOriginOpenerPolicy: { policy: "same-origin" },

  // ── Cross-Origin-Resource-Policy ────────────────────────────────────────────
  // "same-origin" — prevents other origins from reading this API's responses
  // via <img>, <script>, etc. Set to "cross-origin" only if you need CDN caching.
  crossOriginResourcePolicy: { policy: "same-origin" },

  // ── Strict-Transport-Security (HSTS) ────────────────────────────────────────
  // Forces HTTPS for 1 year. includeSubDomains covers api.ashishdwivedi.info.
  // preload: true — submit to the HSTS preload list (https://hstspreload.org)
  // once you're confident in the HTTPS setup.
  strictTransportSecurity: isProd
    ? { maxAge: 31_536_000, includeSubDomains: true, preload: false }
    : false,   // Don't set HSTS in development — breaks localhost HTTP

  // ── X-Frame-Options ─────────────────────────────────────────────────────────
  // Belt-and-suspenders with frame-ancestors 'none' in CSP above.
  // Older browsers that don't support CSP will use this instead.
  frameguard: { action: "deny" },

  // ── X-Content-Type-Options ──────────────────────────────────────────────────
  // Prevents browsers from MIME-sniffing responses away from the declared
  // Content-Type. Always leave this on.
  noSniff: true,

  // ── X-DNS-Prefetch-Control ──────────────────────────────────────────────────
  // Disable DNS prefetching — small privacy/leak improvement.
  dnsPrefetchControl: { allow: false },

  // ── X-Download-Options ──────────────────────────────────────────────────────
  // IE-specific: prevents IE from executing downloads in the site's context.
  ieNoOpen: true,

  // ── X-Permitted-Cross-Domain-Policies ───────────────────────────────────────
  // Restricts Adobe Flash and Acrobat cross-domain policies (legacy, but harmless).
  permittedCrossDomainPolicies: { permittedPolicies: "none" },

  // ── Referrer-Policy ─────────────────────────────────────────────────────────
  // "no-referrer" — the API URL is never leaked as a Referer header to
  // third-party services (e.g. SMTP, MongoDB Atlas).
  referrerPolicy: { policy: "no-referrer" },

  // ── X-Powered-By ────────────────────────────────────────────────────────────
  // Helmet removes this by default. Confirmed here for clarity.
  hidePoweredBy: true,

  // ── Origin-Agent-Cluster ────────────────────────────────────────────────────
  // Requests browser-level process isolation for this origin.
  originAgentCluster: true,
};

module.exports = helmet(helmetOptions);
