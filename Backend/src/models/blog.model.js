const mongoose = require('mongoose');
const slugify  = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    // ── Core ───────────────────────────────────
    title: {
      type:      String,
      required:  [true, 'Title is required'],
      trim:      true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type:      String,
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    excerpt: {
      type:      String,
      trim:      true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
      default:   '',
    },
    content: {
      type:    String,   // HTML from rich text editor
      default: '',
    },

    // ── Media ──────────────────────────────────
    coverImageFileId: {
      type:    mongoose.Schema.Types.ObjectId,
      default: null,
    },
    coverImageUrl: {
      type:    String,   // external URL fallback
      default: '',
    },

    // ── Taxonomy ───────────────────────────────
    category: {
      type:    String,
      trim:    true,
      default: 'General',
    },
    tags: {
      type:    [String],
      default: [],
    },

    // ── Meta ───────────────────────────────────
    author: {
      type:    String,
      trim:    true,
      default: 'Ashish Dwivedi',
    },
    readTime: {
      type:    Number,  // minutes, auto-calculated
      default: 1,
    },
    views:    { type: Number,  default: 0     },
    likes:    { type: Number,  default: 0     },
    featured: { type: Boolean, default: false },
    published:{ type: Boolean, default: false },
    publishedAt: { type: Date, default: null  },
    order:    { type: Number,  default: 0     },

    // ── SEO ────────────────────────────────────
    metaTitle: {
      type:    String,
      trim:    true,
      default: '',
    },
    metaDescription: {
      type:    String,
      trim:    true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────
blogSchema.index({ slug: 1 });
blogSchema.index({ published: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });

// ── Auto slug + readTime before save ──────────
blogSchema.pre('save', async function (next) {
  // Slug
  if (this.isModified('title') || !this.slug) {
    let base    = slugify(this.title, { lower: true, strict: true });
    let slug    = base;
    let counter = 1;
    while (true) {
      const exists = await mongoose.model('Blog').findOne({ slug, _id: { $ne: this._id } });
      if (!exists) break;
      slug = `${base}-${counter++}`;
    }
    this.slug = slug;
  }

  // Read time (avg 200 words/min)
  if (this.isModified('content') && this.content) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
    this.readTime   = Math.max(1, Math.ceil(wordCount / 200));
  }

  // Published timestamp
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// ── Virtual: cover image URL ───────────────────
blogSchema.virtual('coverImage').get(function () {
  if (this.coverImageFileId) return `/api/media/${this.coverImageFileId}`;
  if (this.coverImageUrl)    return this.coverImageUrl;
  return null;
});

module.exports = mongoose.model('Blog', blogSchema);
