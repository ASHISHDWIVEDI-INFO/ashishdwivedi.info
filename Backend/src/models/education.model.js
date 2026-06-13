const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    degree:      { type: String, required: [true, 'Degree is required'], trim: true },
    institution: { type: String, required: [true, 'Institution is required'], trim: true },
    field:       { type: String, trim: true, default: '' },
    grade:       { type: String, trim: true, default: '' },
    startYear:   { type: Number },
    endYear:     { type: Number, default: null },
    isCurrent:   { type: Boolean, default: false },
    description: { type: String, trim: true, default: '' },
    achievements:{ type: [String], default: [] },
    logoUrl:     { type: String, default: '' },
    order:       { type: Number, default: 0 },
    published:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

educationSchema.index({ startYear: -1 });

module.exports = mongoose.model('Education', educationSchema);
