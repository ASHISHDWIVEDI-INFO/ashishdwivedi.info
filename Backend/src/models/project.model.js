const mongoose = require('mongoose');
const slugify  = require('slugify');

const projectSchema = new mongoose.Schema(
  {
    // ── Core ───────────────────────────────────
    title: {
      type:      String,
      required:  [true, 'Project title is required'],
      trim:      true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type:   String,
      unique: true,
      lowercase: true,
      trim:   true,
    },
    shortDescription: {
      type:      String,
      trim:      true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default:   '',
    },
    fullDescription: {
      type:    String,
      trim:    true,
      default: '',
    },

    // ── Media ──────────────────────────────────
    imageFileId: {
      type:    mongoose.Schema.Types.ObjectId,
      default: null,
    },
    imageUrl: {            // fallback external URL
      type:    String,
      default: '',
    },
    gallery: [             // additional screenshots
      {
        fileId: { type: mongoose.Schema.Types.ObjectId },
        caption:{ type: String, default: '' },
      },
    ],

    // ── Tech stack ─────────────────────────────
    technologies: {
      type:    [String],
      default: [],
    },
    category: {
      type:    String,
      enum:    ['web', 'mobile', 'ai-ml', 'devops', 'open-source', 'startup', 'other'],
      default: 'web',
    },

    // ── Links ──────────────────────────────────
    githubUrl: {
      type:    String,
      trim:    true,
      default: '',
    },
    liveUrl: {
      type:    String,
      trim:    true,
      default: '',
    },
    caseStudyUrl: {
      type:    String,
      trim:    true,
      default: '',
    },

    // ── Metadata ───────────────────────────────
    featured:  { type: Boolean, default: false },
    published: { type: Boolean, default: true  },
    order:     { type: Number,  default: 0      },  // lower = shown first
    stats: {
      stars:   { type: Number, default: 0 },
      forks:   { type: Number, default: 0 },
      views:   { type: Number, default: 0 },
    },
    startDate: { type: Date, default: null },
    endDate:   { type: Date, default: null },
    status: {
      type:    String,
      enum:    ['in-progress', 'completed', 'archived', 'on-hold'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────
projectSchema.index({ slug: 1 });
projectSchema.index({ featured: 1, order: 1 });
projectSchema.index({ published: 1, order: 1 });
projectSchema.index({ category: 1 });

// ── Auto-generate slug before save ────────────
projectSchema.pre('save', async function (next) {
  if (!this.isModified('title') && this.slug) return next();

  let baseSlug = slugify(this.title, { lower: true, strict: true });
  let slug     = baseSlug;
  let counter  = 1;

  // Ensure uniqueness
  while (true) {
    const existing = await mongoose.model('Project').findOne({
      slug,
      _id: { $ne: this._id },
    });
    if (!existing) break;
    slug = `${baseSlug}-${counter++}`;
  }

  this.slug = slug;
  next();
});

// ── Virtual: image URL ─────────────────────────
projectSchema.virtual('thumbnail').get(function () {
  if (this.imageFileId) return `/api/media/${this.imageFileId}`;
  if (this.imageUrl)    return this.imageUrl;
  return null;
});

module.exports = mongoose.model('Project', projectSchema);