// #1

// const express = require('express');
// const { body } = require('express-validator');
// const router  = express.Router();

// const {
//   submitContact, getAllContacts, getContact,
//   toggleRead, toggleStar, toggleArchive,
//   markReplied, deleteContact, bulkDelete, exportCSV,
// } = require('../controllers/contact.controller');
// const { protect } = require('../middleware/auth.middleware');

// // ── Validators ───────────────────────────────
// const submitValidation = [
//   body('name')
//     .trim().notEmpty().withMessage('Name is required')
//     .isLength({ max: 100 }).withMessage('Name max 100 chars'),
//   body('email')
//     .isEmail().withMessage('Valid email is required')
//     .normalizeEmail(),
//   body('subject')
//     .trim().notEmpty().withMessage('Subject is required')
//     .isLength({ max: 200 }).withMessage('Subject max 200 chars'),
//   body('message')
//     .trim().notEmpty().withMessage('Message is required')
//     .isLength({ min: 10, max: 5000 })
//     .withMessage('Message must be 10–5000 characters'),
// ];

// // ========================
// // Public
// // ========================
// router.post('/', submitValidation, submitContact);

// // ========================
// // Admin (Protected)
// // ========================
// router.get(   '/',              protect, getAllContacts);
// router.get(   '/export',        protect, exportCSV);
// router.get(   '/:id',           protect, getContact);
// router.patch( '/:id/read',      protect, toggleRead);
// router.patch( '/:id/star',      protect, toggleStar);
// router.patch( '/:id/archive',   protect, toggleArchive);
// router.patch( '/:id/reply',     protect, markReplied);
// router.delete('/bulk',          protect, bulkDelete);
// router.delete('/:id',           protect, deleteContact);

// module.exports = router;

/**
 * contact.routes.js
 * ──────────────────
 * FIX: Route ordering — specific routes BEFORE parameterized routes.
 *
 * THE BUG
 * ───────
 * Express matches routes top-to-bottom, first match wins.
 * If `DELETE /:id` is registered before `DELETE /bulk`, Express sees the
 * request path "/bulk" and matches /:id with id = "bulk".
 *
 * The bulk handler never executes. Instead the single-delete handler runs
 * with id = "bulk", which either:
 *   a) throws a Mongoose CastError ("bulk" is not a valid ObjectId), or
 *   b) silently finds nothing and returns 404 — looking like it worked.
 *
 * THE RULE
 * ────────
 * Always register fixed-path routes BEFORE parameterized routes on the same
 * HTTP method. This applies to any method: GET, POST, PUT, PATCH, DELETE.
 *
 *   ✅  router.delete("/bulk",  bulkDelete);   // registered first
 *   ✅  router.delete("/:id",   deleteOne);    // registered second
 *
 *   ❌  router.delete("/:id",   deleteOne);    // swallows "/bulk"
 *   ❌  router.delete("/bulk",  bulkDelete);   // never reached
 */

// #2
"use strict";

const express = require("express");
const router  = express.Router();

const {
  getContacts,
  getContact,
  deleteContact,
  bulkDeleteContacts,
  markAsRead,
  markAsStarred,
  archiveContact,
  exportContacts,
} = require("../controllers/contact.controller");

const { protect }      = require("../middleware/authMiddleware");
const checkBlocklist   = require("../middleware/checkBlocklist");

// All contact routes are protected.
router.use(protect, checkBlocklist);

// ── Fixed-path routes ─────────────────────────────────────────────────────────
// These MUST come before any route with a :param segment on the same method.

router.get(    "/",          getContacts);
router.get(    "/export",    exportContacts);     // GET  /export  before  GET  /:id
router.delete( "/bulk",      bulkDeleteContacts); // DELETE /bulk  before  DELETE /:id
router.patch(  "/bulk/read", markAsRead);         // PATCH /bulk/read  (same principle)

// ── Parameterized routes ──────────────────────────────────────────────────────
// Safe to register now — all fixed paths above are already claimed.

router.get(    "/:id",          getContact);
router.delete( "/:id",          deleteContact);
router.patch(  "/:id/read",     markAsRead);
router.patch(  "/:id/star",     markAsStarred);
router.patch(  "/:id/archive",  archiveContact);

module.exports = router;