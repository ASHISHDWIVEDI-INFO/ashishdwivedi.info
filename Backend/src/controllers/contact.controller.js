const { validationResult } = require('express-validator');
const Contact = require('../models/contact.model');
const { sendContactNotification, sendAutoReply } = require('../services/email.service');

// ========================
// @POST /api/contact
// @desc  Submit contact form (public)
// @access Public
// ========================
exports.submitContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { name, email, subject, message } = req.body;

    // Save to DB
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      ipAddress: req.ip || req.connection.remoteAddress || '',
      userAgent: req.get('User-Agent') || '',
    });

    // Send emails (fire-and-forget — don't block response)
    Promise.all([
      sendContactNotification({ name, email, subject, message }),
      sendAutoReply({ name, email, subject }),
    ]).catch(err => console.warn('⚠️  Email send error:', err.message));

    res.status(201).json({
      success: true,
      message: 'Your message has been sent! I\'ll get back to you soon.',
      data: { id: contact._id },
    });
  } catch (error) {
    console.error('submitContact error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
};

// ========================
// @GET /api/contact
// @desc  Get all messages (admin inbox)
// @access Private
// ========================
exports.getAllContacts = async (req, res) => {
  try {
    const {
      isRead, isStarred, isArchived,
      page = 1, limit = 20, sort = '-createdAt',
    } = req.query;

    const filter = {};
    if (isRead     !== undefined) filter.isRead     = isRead     === 'true';
    if (isStarred  !== undefined) filter.isStarred  = isStarred  === 'true';
    if (isArchived !== undefined) filter.isArchived = isArchived === 'true';
    else filter.isArchived = false;  // default: exclude archived

    const pageSize = Math.min(parseInt(limit), 50);
    const skip     = (parseInt(page) - 1) * pageSize;

    const [contacts, total, unreadCount] = await Promise.all([
      Contact.find(filter).sort(sort).skip(skip).limit(pageSize),
      Contact.countDocuments(filter),
      Contact.countDocuments({ isRead: false, isArchived: false }),
    ]);

    res.status(200).json({
      success: true,
      total,
      unreadCount,
      page:  parseInt(page),
      pages: Math.ceil(total / pageSize),
      data:  contacts,
    });
  } catch (error) {
    console.error('getAllContacts error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @GET /api/contact/:id
// @access Private
// ========================
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found.' });

    // Auto-mark as read on open
    if (!contact.isRead) {
      contact.isRead = true;
      await contact.save();
    }

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @PATCH /api/contact/:id/read
// @desc  Toggle read/unread
// @access Private
// ========================
exports.toggleRead = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found.' });
    contact.isRead = !contact.isRead;
    await contact.save();
    res.status(200).json({ success: true, isRead: contact.isRead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @PATCH /api/contact/:id/star
// @desc  Toggle starred
// @access Private
// ========================
exports.toggleStar = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found.' });
    contact.isStarred = !contact.isStarred;
    await contact.save();
    res.status(200).json({ success: true, isStarred: contact.isStarred });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @PATCH /api/contact/:id/archive
// @desc  Toggle archived
// @access Private
// ========================
exports.toggleArchive = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found.' });
    contact.isArchived = !contact.isArchived;
    await contact.save();
    res.status(200).json({ success: true, isArchived: contact.isArchived });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @PATCH /api/contact/:id/reply
// @desc  Mark as replied + add note
// @access Private
// ========================
exports.markReplied = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: { repliedAt: new Date(), replyNote: req.body.note || '', isRead: true } },
      { new: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @DELETE /api/contact/:id
// @access Private
// ========================
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.status(200).json({ success: true, message: 'Message deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @DELETE /api/contact/bulk
// @desc  Delete multiple messages
// @access Private
// ========================
exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ success: false, message: 'ids array required.' });
    const result = await Contact.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @GET /api/contact/export
// @desc  Export messages as CSV
// @access Private
// ========================
exports.exportCSV = async (req, res) => {
  try {
    const contacts = await Contact.find({ isArchived: false }).sort('-createdAt').limit(1000);

    const header = 'Name,Email,Subject,Message,Date,Read,Starred\n';
    const rows   = contacts.map(c => {
      const escape = (v) => `"${String(v || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      return [
        escape(c.name),
        escape(c.email),
        escape(c.subject),
        escape(c.message),
        escape(c.createdAt.toISOString()),
        escape(c.isRead),
        escape(c.isStarred),
      ].join(',');
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="contacts-${Date.now()}.csv"`);
    res.send(header + rows);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Export failed.' });
  }
};
