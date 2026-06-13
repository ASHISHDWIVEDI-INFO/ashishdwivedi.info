const mongoose = require('mongoose');
const settingsSchema = new mongoose.Schema({
  siteTitle:          { type: String, default: 'Ashish Dwivedi' },
  siteTagline:        { type: String, default: 'Founder & Software Engineer' },
  metaDescription:    { type: String, default: '' },
  contactEmail:       { type: String, default: '' },
  phone:              { type: String, default: '' },
  address:            { type: String, default: '' },
  footerText:         { type: String, default: '' },
  maintenanceMode:    { type: Boolean, default: false },
  analyticsId:        { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('Settings', settingsSchema);
