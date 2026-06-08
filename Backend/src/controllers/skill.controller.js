const Skill = require('../models/skill.model');

// ========================
// @GET /api/skills
// @desc  Get all skills (optionally grouped by category)
// @access Public
// ========================
exports.getAllSkills = async (req, res) => {
  try {
    const { category, featured, grouped } = req.query;

    const filter = {};
    if (!req.user)              filter.published = true;
    if (category)               filter.category  = category;
    if (featured !== undefined) filter.featured  = featured === 'true';

    const skills = await Skill.find(filter).sort({ category: 1, order: 1, name: 1 });

    // Group by category if requested
    if (grouped === 'true') {
      const grouped = skills.reduce((acc, skill) => {
        const cat = skill.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
      }, {});

      return res.status(200).json({ success: true, total: skills.length, data: grouped });
    }

    res.status(200).json({ success: true, total: skills.length, data: skills });
  } catch (error) {
    console.error('getAllSkills error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching skills.' });
  }
};

// ========================
// @GET /api/skills/:id
// @access Public
// ========================
exports.getSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found.' });
    res.status(200).json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @POST /api/skills
// @access Private
// ========================
exports.createSkill = async (req, res) => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json({ success: true, message: 'Skill created.', data: skill });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const msg = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: 'Server error creating skill.' });
  }
};

// ========================
// @PUT /api/skills/:id
// @access Private
// ========================
exports.updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found.' });
    res.status(200).json({ success: true, message: 'Skill updated.', data: skill });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error updating skill.' });
  }
};

// ========================
// @DELETE /api/skills/:id
// @access Private
// ========================
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found.' });
    res.status(200).json({ success: true, message: 'Skill deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting skill.' });
  }
};

// ========================
// @PUT /api/skills/reorder
// @desc  Bulk update order field
// @access Private
// ========================
exports.reorderSkills = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items))
      return res.status(400).json({ success: false, message: 'items array required.' });

    await Skill.bulkWrite(
      items.map(({ id, order }) => ({
        updateOne: { filter: { _id: id }, update: { $set: { order } } },
      }))
    );

    res.status(200).json({ success: true, message: 'Skills reordered.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error reordering.' });
  }
};

// ========================
// @POST /api/skills/bulk
// @desc  Create many skills at once (seed)
// @access Private
// ========================
exports.bulkCreate = async (req, res) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills))
      return res.status(400).json({ success: false, message: 'skills array required.' });

    const created = await Skill.insertMany(skills, { ordered: false });
    res.status(201).json({ success: true, count: created.length, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error bulk creating skills.' });
  }
};
