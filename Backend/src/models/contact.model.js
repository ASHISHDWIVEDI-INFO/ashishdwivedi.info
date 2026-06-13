const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    // ── Sender info ────────────────────────────
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type:     String,
      required: [true, 'Email is required'],
      trim:     true,
      lowercase:true,
      match:    [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    subject: {
      type:      String,
      required:  [true, 'Subject is required'],
      trim:      true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type:      String,
      required:  [true, 'Message is required'],
      trim:      true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },

    // ── Status ─────────────────────────────────
    isRead: {
      type:    Boolean,
      default: false,
    },
    isStarred: {
      type:    Boolean,
      default: false,
    },
    isArchived: {
      type:    Boolean,
      default: false,
    },

    // ── Reply ──────────────────────────────────
    repliedAt: {
      type:    Date,
      default: null,
    },
    replyNote: {
      type:    String,
      default: '',
    },

    // ── Meta ───────────────────────────────────
    ipAddress: {
      type:    String,
      default: '',
    },
    userAgent: {
      type:    String,
      default: '',
    },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────
contactSchema.index({ isRead: 1, createdAt: -1 });
contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
