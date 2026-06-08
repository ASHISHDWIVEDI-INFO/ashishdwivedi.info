const mongoose  = require('mongoose');
const { getGFSBucket } = require('../config/gridfs');
const Blog = require('../models/blog.model');

// ── Delete GridFS file helper ─────────────────
const deleteFile = async (fileId) => {
  if (!fileId) return;
  try { await getGFSBucket().delete(new mongoose.Types.ObjectId(fileId)); }
  catch (e) { console.warn('GridFS delete warn:', e.message); }
};

// ========================
// @GET /api/blog
// @access Public
// ========================
exports.getAllPosts = async (req, res) => {
  try {
    const {
      category, tag, featured,
      page = 1, limit = 10, sort = '-publishedAt',
    } = req.query;

    const filter = {};
    if (!req.user)              filter.published = true;
    if (category)               filter.category  = category;
    if (tag)                    filter.tags       = tag;
    if (featured !== undefined) filter.featured   = featured === 'true';

    const pageSize = Math.min(parseInt(limit) || 10, 50);
    const skip     = (parseInt(page) - 1) * pageSize;

    const [posts, total] = await Promise.all([
      Blog.find(filter)
        .select('-content')   // exclude heavy content from list
        .sort(sort)
        .skip(skip)
        .limit(pageSize),
      Blog.countDocuments(filter),
    ]);

    // Get unique categories and tags for filtering UI
    const [categories, tags] = await Promise.all([
      Blog.distinct('category', { published: true }),
      Blog.distinct('tags',     { published: true }),
    ]);

    res.status(200).json({
      success: true,
      total,
      page:       parseInt(page),
      pages:      Math.ceil(total / pageSize),
      categories,
      tags,
      data:       posts,
    });
  } catch (error) {
    console.error('getAllPosts error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching posts.' });
  }
};

// ========================
// @GET /api/blog/:slug
// @access Public
// ========================
exports.getPost = async (req, res) => {
  try {
    const { slug } = req.params;
    const query    = mongoose.Types.ObjectId.isValid(slug)
      ? { _id: slug }
      : { slug };

    const post = await Blog.findOne(query);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (!post.published && !req.user)
      return res.status(404).json({ success: false, message: 'Post not found.' });

    // Increment views
    Blog.findByIdAndUpdate(post._id, { $inc: { views: 1 } }).catch(() => {});

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @POST /api/blog
// @access Private
// ========================
exports.createPost = async (req, res) => {
  try {
    if (typeof req.body.tags === 'string') {
      try { req.body.tags = JSON.parse(req.body.tags); } catch {}
    }
    const post = await Blog.create(req.body);
    res.status(201).json({ success: true, message: 'Post created.', data: post });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const msg = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: 'Server error creating post.' });
  }
};

// ========================
// @PUT /api/blog/:id
// @access Private
// ========================
exports.updatePost = async (req, res) => {
  try {
    if (typeof req.body.tags === 'string') {
      try { req.body.tags = JSON.parse(req.body.tags); } catch {}
    }
    delete req.body.coverImageFileId;

    const post = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.status(200).json({ success: true, message: 'Post updated.', data: post });
  } catch (error) {
    if (error.name === 'ValidationError')
      return res.status(400).json({ success: false, message: Object.values(error.errors).map(e => e.message).join(', ') });
    res.status(500).json({ success: false, message: 'Server error updating post.' });
  }
};

// ========================
// @DELETE /api/blog/:id
// @access Private
// ========================
exports.deletePost = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    await deleteFile(post.coverImageFileId);
    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Post deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting post.' });
  }
};

// ========================
// @PATCH /api/blog/:id/publish
// @access Private
// ========================
exports.togglePublish = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    post.published = !post.published;
    if (post.published && !post.publishedAt) post.publishedAt = new Date();
    await post.save();
    res.status(200).json({
      success:   true,
      message:   `Post ${post.published ? 'published' : 'unpublished'}.`,
      published: post.published,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @PATCH /api/blog/:id/featured
// @access Private
// ========================
exports.toggleFeatured = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    post.featured = !post.featured;
    await post.save();
    res.status(200).json({ success: true, featured: post.featured });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ========================
// @POST /api/blog/:id/cover
// @access Private
// ========================
exports.uploadCover = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image provided.' });
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    await deleteFile(post.coverImageFileId);
    post.coverImageFileId = req.file.id;
    await post.save();
    res.status(200).json({
      success: true,
      message: 'Cover image uploaded.',
      data:    { fileId: req.file.id, coverUrl: `/api/media/${req.file.id}` },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error uploading cover.' });
  }
};
