const mongoose = require('mongoose');
const testimonialSchema = new mongoose.Schema({
  name:       { type: String, required: [true, 'Name is required'], trim: true },
  role:       { type: String, trim: true, default: '' },
  company:    { type: String, trim: true, default: '' },
  content:    { type: String, required: [true, 'Content is required'], trim: true },
  rating:     { type: Number, min: 1, max: 5, default: 5 },
  photoUrl:   { type: String, default: '' },
  type:       { type: String, enum: ['client','investor','team','mentor','other'], default: 'client' },
  featured:   { type: Boolean, default: false },
  published:  { type: Boolean, default: true },
  order:      { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model('Testimonial', testimonialSchema);
