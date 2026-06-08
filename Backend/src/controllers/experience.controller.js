const Experience = require('../models/experience.model');

// ========================
// @GET /api/experience
// @access Public
// ========================
exports.getAllExperience = async (req, res) => {
  try {
    const filter = {};
    if (!req.user) filter.published = true;

    const experiences = await Experience
      .find(filter)
      .sort({ isCurrent: -1, startDate: -1, order: 1 });

    res.status(200).json({ success: true, total: experiences.length, data: experiences });
  } catch (error) {
    console.error('getAllExperience error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching experience.' });
  }
};

// ========================
// @GET /api/experience/:id
// @access Public
// ========================
exports.getExperience = async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: 'Experience not found.' });
    res.status(200).json({ success: true, data: exp });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @POST /api/experience
// @access Private
// ========================
exports.createExperience = async (req, res) => {
  try {
    // Parse arrays if sent as JSON strings
    ['responsibilities', 'achievements', 'technologiesUsed'].forEach(field => {
      if (typeof req.body[field] === 'string') {
        try { req.body[field] = JSON.parse(req.body[field]); } catch {}
      }
    });

    // If marked as current, clear endDate
    if (req.body.isCurrent) req.body.endDate = null;

    const exp = await Experience.create(req.body);
    res.status(201).json({ success: true, message: 'Experience created.', data: exp });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const msg = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: 'Server error creating experience.' });
  }
};

// ========================
// @PUT /api/experience/:id
// @access Private
// ========================
exports.updateExperience = async (req, res) => {
  try {
    ['responsibilities', 'achievements', 'technologiesUsed'].forEach(field => {
      if (typeof req.body[field] === 'string') {
        try { req.body[field] = JSON.parse(req.body[field]); } catch {}
      }
    });

    if (req.body.isCurrent) req.body.endDate = null;

    const exp = await Experience.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!exp) return res.status(404).json({ success: false, message: 'Experience not found.' });
    res.status(200).json({ success: true, message: 'Experience updated.', data: exp });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error updating experience.' });
  }
};

// ========================
// @DELETE /api/experience/:id
// @access Private
// ========================
exports.deleteExperience = async (req, res) => {
  try {
    const exp = await Experience.findByIdAndDelete(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: 'Experience not found.' });
    res.status(200).json({ success: true, message: 'Experience deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting experience.' });
  }
};

// ========================
// @PUT /api/experience/reorder
// @access Private
// ========================
exports.reorderExperience = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items))
      return res.status(400).json({ success: false, message: 'items array required.' });

    await Experience.bulkWrite(
      items.map(({ id, order }) => ({
        updateOne: { filter: { _id: id }, update: { $set: { order } } },
      }))
    );
    res.status(200).json({ success: true, message: 'Experience reordered.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error reordering.' });
  }
};