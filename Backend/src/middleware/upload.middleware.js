const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');
const crypto = require('crypto');

// ── Allowed MIME types ────────────────────────
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const DOC_TYPES   = ['application/pdf'];

// ── GridFS storage factory ────────────────────
const createGridFSStorage = (bucketName = 'uploads', metadataFn = null) =>
  new GridFsStorage({
    url: process.env.MONGODB_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        // Random filename to prevent collisions
        crypto.randomBytes(16, (err, buf) => {
          if (err) return reject(err);

          const ext      = path.extname(file.originalname).toLowerCase();
          const filename = `${buf.toString('hex')}${ext}`;

          resolve({
            filename,
            bucketName,
            metadata: metadataFn ? metadataFn(req, file) : {
              originalName: file.originalname,
              mimetype:     file.mimetype,
              uploadedBy:   req.user?._id || null,
              uploadedAt:   new Date(),
            },
          });
        });
      });
    },
  });

// ── File filter factories ─────────────────────
const imageFilter = (req, file, cb) => {
  if (IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF)'), false);
  }
};

const pdfFilter = (req, file, cb) => {
  if (DOC_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const anyFileFilter = (req, file, cb) => {
  const allowed = [...IMAGE_TYPES, ...DOC_TYPES];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

// ── Upload instances ──────────────────────────

/** Profile photo upload — images only, max 5MB */
const uploadPhoto = multer({
  storage:  createGridFSStorage('uploads', (req, file) => ({
    originalName: file.originalname,
    mimetype:     file.mimetype,
    type:         'profile-photo',
    uploadedBy:   req.user?._id || null,
  })),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/** Resume upload — PDF only, max 10MB */
const uploadResume = multer({
  storage: createGridFSStorage('uploads', (req, file) => ({
    originalName: file.originalname,
    mimetype:     file.mimetype,
    type:         'resume',
    uploadedBy:   req.user?._id || null,
  })),
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

/** General media upload — images, max 8MB */
const uploadMedia = multer({
  storage:    createGridFSStorage('uploads', (req, file) => ({
    originalName: file.originalname,
    mimetype:     file.mimetype,
    type:         'media',
    uploadedBy:   req.user?._id || null,
  })),
  fileFilter: imageFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

/** Project image — images only, max 8MB */
const uploadProjectImage = multer({
  storage: createGridFSStorage('uploads', (req, file) => ({
    originalName: file.originalname,
    mimetype:     file.mimetype,
    type:         'project-image',
    projectId:    req.params.id || null,
    uploadedBy:   req.user?._id || null,
  })),
  fileFilter: imageFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

// ── Multer error handler middleware ───────────
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Please upload a smaller file.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed.',
    });
  }
  next();
};

module.exports = {
  uploadPhoto,
  uploadResume,
  uploadMedia,
  uploadProjectImage,
  handleUploadError,
};
