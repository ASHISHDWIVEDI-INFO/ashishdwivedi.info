const mongoose  = require('mongoose');
const { getGFSBucket } = require('../config/gridfs');
const Project   = require('../models/project.model');

// ── Helper: delete GridFS file safely ─────────
const deleteFile = async (fileId) => {
  if (!fileId) return;
  try {
    await getGFSBucket().delete(new mongoose.Types.ObjectId(fileId));
  } catch (e) {
    console.warn('⚠️  GridFS delete warn:', e.message);
  }
};

// ========================
// @GET /api/projects
// @desc List all projects (public + admin)
// @access Public
// ========================
exports.getAllProjects = async (req, res) => {
  try {
    const {
      featured, published, category, limit, page = 1, sort = 'order',
    } = req.query;

    const filter = {};
    if (featured  !== undefined) filter.featured  = featured  === 'true';
    if (published !== undefined) filter.published = published === 'true';
    else if (!req.user)          filter.published = true;  // public: only published
    if (category) filter.category = category;

    const pageSize = Math.min(parseInt(limit) || 50, 100);
    const skip     = (parseInt(page) - 1) * pageSize;
    const sortObj  = sort === 'newest'
      ? { createdAt: -1 }
      : sort === 'oldest'
      ? { createdAt: 1 }
      : { order: 1, createdAt: -1 };

    const [projects, total] = await Promise.all([
      Project.find(filter).sort(sortObj).skip(skip).limit(pageSize),
      Project.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / pageSize),
      data:  projects,
    });
  } catch (error) {
    console.error('getAllProjects error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching projects.' });
  }
};

// ========================
// @GET /api/projects/:id
// @desc Get single project by id or slug
// @access Public
// ========================
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const query  = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { slug: id };

    const project = await Project.findOne(query);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Increment view count (fire and forget)
    Project.findByIdAndUpdate(project._id, { $inc: { 'stats.views': 1 } }).catch(() => {});

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @POST /api/projects
// @desc Create new project
// @access Private
// ========================
exports.createProject = async (req, res) => {
  try {
    // Parse technologies if sent as JSON string
    if (typeof req.body.technologies === 'string') {
      try { req.body.technologies = JSON.parse(req.body.technologies); } catch {}
    }

    const project = await Project.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data:    project,
    });
  } catch (error) {
    console.error('createProject error:', error);
    if (error.name === 'ValidationError') {
      const msg = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: 'Server error creating project.' });
  }
};

// ========================
// @PUT /api/projects/:id
// @desc Update project
// @access Private
// ========================
exports.updateProject = async (req, res) => {
  try {
    if (typeof req.body.technologies === 'string') {
      try { req.body.technologies = JSON.parse(req.body.technologies); } catch {}
    }

    // Prevent overwriting imageFileId from body
    delete req.body.imageFileId;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data:    project,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error updating project.' });
  }
};

// ========================
// @DELETE /api/projects/:id
// @desc Delete project + its GridFS image
// @access Private
// ========================
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Delete image from GridFS
    await deleteFile(project.imageFileId);

    // Delete gallery images
    for (const g of project.gallery) {
      await deleteFile(g.fileId);
    }

    await project.deleteOne();

    res.status(200).json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting project.' });
  }
};

// ========================
// @POST /api/projects/:id/image
// @desc Upload / replace project image
// @access Private
// ========================
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Delete old image
    await deleteFile(project.imageFileId);

    project.imageFileId = req.file.id;
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project image uploaded.',
      data: {
        fileId:   req.file.id,
        imageUrl: `/api/media/${req.file.id}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error uploading image.' });
  }
};

// ========================
// @PATCH /api/projects/:id/featured
// @desc Toggle featured status
// @access Private
// ========================
exports.toggleFeatured = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    project.featured = !project.featured;
    await project.save();

    res.status(200).json({
      success:  true,
      message:  `Project ${project.featured ? 'marked as featured' : 'removed from featured'}.`,
      featured: project.featured,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @PATCH /api/projects/:id/publish
// @desc Toggle published status
// @access Private
// ========================
exports.togglePublished = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    project.published = !project.published;
    await project.save();

    res.status(200).json({
      success:   true,
      message:   `Project ${project.published ? 'published' : 'unpublished'}.`,
      published: project.published,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @PUT /api/projects/reorder
// @desc Bulk reorder projects
// @access Private
// ========================
exports.reorderProjects = async (req, res) => {
  try {
    const { items } = req.body; // [{ id, order }]
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'items array is required.' });
    }

    const ops = items.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } },
      },
    }));

    await Project.bulkWrite(ops);

    res.status(200).json({ success: true, message: 'Projects reordered.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error reordering projects.' });
  }
};

