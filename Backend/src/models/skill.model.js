const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    // ── Core ───────────────────────────────────
    name: {
      type:      String,
      required:  [true, 'Skill name is required'],
      trim:      true,
      maxlength: [60, 'Skill name cannot exceed 60 characters'],
    },
    category: {
      type:    String,
      required:[true, 'Category is required'],
      enum: [
        'frontend',
        'backend',
        'database',
        'cloud-devops',
        'mobile',
        'ai-ml',
        'tools',
        'soft-skills',
        'other',
      ],
      default: 'other',
    },

    // ── Proficiency ────────────────────────────
    proficiency: {
      type:    Number,
      min:     [1,   'Proficiency must be at least 1'],
      max:     [100, 'Proficiency cannot exceed 100'],
      default: 80,
    },
    level: {
      type:    String,
      enum:    ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'advanced',
    },

    // ── Visual ─────────────────────────────────
    icon: {
      type:    String,   // devicon class or simple-icons slug e.g. "devicon-react-original"
      trim:    true,
      default: '',
    },
    color: {
      type:    String,   // hex color for accent e.g. "#61DAFB"
      trim:    true,
      default: '#7C3AED',
    },

    // ── Meta ───────────────────────────────────
    yearsOfExperience: {
      type:    Number,
      min:     0,
      default: 0,
    },
    featured: {
      type:    Boolean,
      default: false,
    },
    published: {
      type:    Boolean,
      default: true,
    },
    order: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────
skillSchema.index({ category: 1, order: 1 });
skillSchema.index({ featured: 1 });
skillSchema.index({ published: 1 });

module.exports = mongoose.model('Skill', skillSchema);
