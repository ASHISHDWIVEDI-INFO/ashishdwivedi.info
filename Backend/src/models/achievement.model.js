const mongoose = require('mongoose');
const achievementSchema = new mongoose.Schema({
  title:       { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, trim: true, default: '' },
  category:    { type: String, enum: ['award','competition','speaking','publication','milestone','other'], default: 'award' },
  date:        { type: Date },
  issuer:      { type: String, trim: true, default: '' },
  url:         { type: String, trim: true, default: '' },
  icon:        { type: String, default: '🏆' },
  featured:    { type: Boolean, default: false },
  published:   { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model('Achievement', achievementSchema);
