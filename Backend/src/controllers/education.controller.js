const Education = require('../models/education.model');

exports.getAll = async (req, res) => {
  try {
    const filter = req.user ? {} : { published: true };
    const data = await Education.find(filter).sort({ isCurrent: -1, startYear: -1, order: 1 });
    res.json({ success: true, total: data.length, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await Education.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    if (typeof req.body.achievements === 'string') {
      try { req.body.achievements = JSON.parse(req.body.achievements); } catch {}
    }
    const doc = await Education.create(req.body);
    res.status(201).json({ success: true, message: 'Education created.', data: doc });
  } catch (e) {
    if (e.name === 'ValidationError')
      return res.status(400).json({ success: false, message: Object.values(e.errors).map(x => x.message).join(', ') });
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    if (typeof req.body.achievements === 'string') {
      try { req.body.achievements = JSON.parse(req.body.achievements); } catch {}
    }
    const doc = await Education.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, message: 'Education updated.', data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Education.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, message: 'Education deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
