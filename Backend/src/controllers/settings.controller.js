const Settings = require('../models/settings.model');

exports.getSettings = async (req, res) => {
  try {
    let doc = await Settings.findOne();
    if (!doc) doc = await Settings.create({});
    res.json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateSettings = async (req, res) => {
  try {
    const doc = await Settings.findOneAndUpdate({}, { $set: req.body }, { new: true, upsert: true, runValidators: true });
    res.json({ success: true, message: 'Settings updated.', data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
