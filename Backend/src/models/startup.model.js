const mongoose = require('mongoose');
const startupSchema = new mongoose.Schema({
  name:        { type: String, required: [true, 'Name is required'], trim: true },
  tagline:     { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  problem:     { type: String, trim: true, default: '' },
  solution:    { type: String, trim: true, default: '' },
  website:     { type: String, trim: true, default: '' },
  logoFileId:  { type: mongoose.Schema.Types.ObjectId, default: null },
  logoUrl:     { type: String, default: '' },
  status:      { type: String, enum: ['active','acquired','closed','stealth'], default: 'active' },
  founded:     { type: Number },
  teamSize:    { type: Number, default: 1 },
  metrics: {
    users:    { type: String, default: '' },
    revenue:  { type: String, default: '' },
    growth:   { type: String, default: '' },
  },
  techStack:   { type: [String], default: [] },
  keyFeatures: { type: [String], default: [] },
  featured:    { type: Boolean, default: false },
  published:   { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model('Startup', startupSchema);
