const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    // ── Role ───────────────────────────────────
    role: {
      type:      String,
      required:  [true, 'Role / job title is required'],
      trim:      true,
      maxlength: [120, 'Role cannot exceed 120 characters'],
    },
    company: {
      type:      String,
      required:  [true, 'Company name is required'],
      trim:      true,
      maxlength: [120, 'Company cannot exceed 120 characters'],
    },
    companyUrl: {
      type:    String,
      trim:    true,
      default: '',
    },
    companyLogo: {
      type:    String,  // URL or GridFS file ID
      default: '',
    },
    location: {
      type:    String,
      trim:    true,
      default: '',
    },
    employmentType: {
      type:    String,
      enum:    ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'co-founder'],
      default: 'full-time',
    },

    // ── Duration ───────────────────────────────
    startDate: {
      type:     Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type:    Date,
      default: null,   // null = current / present
    },
    isCurrent: {
      type:    Boolean,
      default: false,
    },

    // ── Details ────────────────────────────────
    summary: {
      type:      String,
      trim:      true,
      maxlength: [500, 'Summary cannot exceed 500 characters'],
      default:   '',
    },
    responsibilities: {
      type:    [String],
      default: [],
    },
    achievements: {
      type:    [String],
      default: [],
    },
    technologiesUsed: {
      type:    [String],
      default: [],
    },

    // ── Meta ───────────────────────────────────
    order:     { type: Number,  default: 0     },
    published: { type: Boolean, default: true  },
    featured:  { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────
experienceSchema.index({ startDate: -1 });
experienceSchema.index({ order: 1 });
experienceSchema.index({ isCurrent: 1 });

// ── Virtual: duration string ───────────────────
experienceSchema.virtual('duration').get(function () {
  const start = new Date(this.startDate);
  const end   = this.isCurrent ? new Date() : new Date(this.endDate);
  const months = (end.getFullYear() - start.getFullYear()) * 12
               + (end.getMonth()    - start.getMonth());
  if (months < 1)  return 'Less than a month';
  if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
  const yrs = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${yrs}y ${rem}m` : `${yrs} year${yrs > 1 ? 's' : ''}`;
});

module.exports = mongoose.model('Experience', experienceSchema);