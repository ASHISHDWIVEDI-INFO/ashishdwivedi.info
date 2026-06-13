const Startup = require('../models/startup.model');

const parseArr = (body, ...fields) => fields.forEach(f => {
  if (typeof body[f] === 'string') try { body[f] = JSON.parse(body[f]); } catch {}
});

exports.getAll = async (req, res) => {
  try {
    const filter = req.user ? {} : { published: true };
    const data = await Startup.find(filter).sort({ featured: -1, order: 1 });
    res.json({ success: true, total: data.length, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await Startup.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    parseArr(req.body, 'techStack', 'keyFeatures');
    const doc = await Startup.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    if (e.name === 'ValidationError') return res.status(400).json({ success: false, message: Object.values(e.errors).map(x => x.message).join(', ') });
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    parseArr(req.body, 'techStack', 'keyFeatures');
    const doc = await Startup.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Startup.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, message: 'Deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
