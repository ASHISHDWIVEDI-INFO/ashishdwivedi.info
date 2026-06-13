const mongoose = require('mongoose');

const socialLinksSchema = new mongoose.Schema(
  {
    linkedin:  { type: String, default: '' },
    github:    { type: String, default: '' },
    twitter:   { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube:   { type: String, default: '' },
    website:   { type: String, default: '' },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    // ── Personal ──────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
      default: 'Founder | Software Engineer | Entrepreneur',
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
      default: 'Building scalable digital products and startups.',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
      default: '',
    },
    about: {
      type: String,
      trim: true,
      maxlength: [5000, 'About cannot exceed 5000 characters'],
      default: '',
    },
    mission: {
      type: String,
      trim: true,
      maxlength: [1000, 'Mission cannot exceed 1000 characters'],
      default: '',
    },
    vision: {
      type: String,
      trim: true,
      maxlength: [1000, 'Vision cannot exceed 1000 characters'],
      default: '',
    },

    // ── Contact ───────────────────────────────
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: 'New Delhi, India',
    },
    availability: {
      type: String,
      enum: ['available', 'busy', 'not-available'],
      default: 'available',
    },

    // ── Stats / Counters (About section) ──────
    stats: {
      yearsExperience: { type: Number, default: 5 },
      projectsCompleted: { type: Number, default: 50 },
      happyClients:      { type: Number, default: 30 },
      startupsFounded:   { type: Number, default: 3 },
    },

    // ── Social Links ──────────────────────────
    socialLinks: {
      type: socialLinksSchema,
      default: () => ({}),
    },

    // ── Media (GridFS file IDs) ───────────────
    photoFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    resumeFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    resumeFileName: {
      type: String,
      default: '',
    },
    resumeDownloadCount: {
      type: Number,
      default: 0,
    },

    // ── SEO / Meta ────────────────────────────
    metaTitle: {
      type: String,
      trim: true,
      default: '',
    },
    metaDescription: {
      type: String,
      trim: true,
      default: '',
    },

    // ── CTA Buttons (Hero section) ────────────
    ctaButtons: {
      type: [
        {
          label:  { type: String, default: '' },
          href:   { type: String, default: '' },
          variant:{ type: String, enum: ['primary', 'outline', 'ghost'], default: 'primary' },
        },
      ],
      default: [
        { label: 'View Portfolio', href: '#projects',  variant: 'primary'  },
        { label: 'Contact Me',     href: '#contact',   variant: 'outline'  },
        { label: 'Download Resume',href: '/api/resume/download', variant: 'ghost' },
      ],
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Virtual: photo URL ─────────────────────
profileSchema.virtual('photoUrl').get(function () {
  if (!this.photoFileId) return null;
  return `/api/media/${this.photoFileId}`;
});

// ── Virtual: resume download URL ──────────
profileSchema.virtual('resumeUrl').get(function () {
  if (!this.resumeFileId) return null;
  return `/api/resume/download`;
});

module.exports = mongoose.model('Profile', profileSchema);