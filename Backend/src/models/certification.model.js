const mongoose = require('mongoose');
const certSchema = new mongoose.Schema({
  name:           { type: String, required: [true, 'Name is required'], trim: true },
  issuer:         { type: String, required: [true, 'Issuer is required'], trim: true },
  issueDate:      { type: Date },
  expiryDate:     { type: Date, default: null },
  noExpiry:       { type: Boolean, default: false },
  credentialId:   { type: String, trim: true, default: '' },
  credentialUrl:  { type: String, trim: true, default: '' },
  badgeUrl:       { type: String, default: '' },
  category:       { type: String, default: 'General' },
  published:      { type: Boolean, default: true },
  order:          { type: Number, default: 0 },
}, { timestamps: true });
certSchema.index({ issueDate: -1 });
module.exports = mongoose.model('Certification', certSchema);
