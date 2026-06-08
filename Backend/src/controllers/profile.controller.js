const mongoose = require('mongoose');
const { getGFSBucket } = require('../config/gridfs');
const Profile = require('../models/profile.model');

// ── Helper: delete old GridFS file ────────────
const deleteGridFSFile = async (fileId) => {
  if (!fileId) return;
  try {
    const bucket = getGFSBucket();
    await bucket.delete(new mongoose.Types.ObjectId(fileId));
  } catch (err) {
    console.warn(`⚠️  Could not delete GridFS file ${fileId}:`, err.message);
  }
};

// ── Helper: get or create singleton profile ───
const getOrCreateProfile = async () => {
  let profile = await Profile.findOne();
  if (!profile) {
    profile = await Profile.create({ name: 'Ashish Dwivedi' });
  }
  return profile;
};

// ========================
// @GET /api/profile
// @desc Get profile (public)
// @access Public
// ========================
exports.getProfile = async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
};

// ========================
// @PUT /api/profile
// @desc Update profile
// @access Private (admin)
// ========================
exports.updateProfile = async (req, res) => {
  try {
    // Fields the client is NOT allowed to set manually
    const forbidden = ['photoFileId', 'resumeFileId', 'resumeDownloadCount', '_id', '__v'];
    forbidden.forEach((f) => delete req.body[f]);

    const profile = await Profile.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: profile,
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    if (error.name === 'ValidationError') {
      const msg = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

// ========================
// @POST /api/profile/photo
// @desc Upload / replace profile photo
// @access Private
// ========================
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo file provided.' });
    }

    const profile = await getOrCreateProfile();

    // Delete previous photo from GridFS
    if (profile.photoFileId) {
      await deleteGridFSFile(profile.photoFileId);
    }

    // Save new file ID
    profile.photoFileId = req.file.id;
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully.',
      data: {
        fileId:   req.file.id,
        filename: req.file.filename,
        photoUrl: `/api/media/${req.file.id}`,
      },
    });
  } catch (error) {
    console.error('uploadPhoto error:', error);
    res.status(500).json({ success: false, message: 'Server error uploading photo.' });
  }
};

// ========================
// @GET /api/profile/photo
// @desc Stream profile photo from GridFS
// @access Public
// ========================
exports.servePhoto = async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile?.photoFileId) {
      return res.status(404).json({ success: false, message: 'No profile photo found.' });
    }

    const bucket = getGFSBucket();
    const fileId = new mongoose.Types.ObjectId(profile.photoFileId);

    // Get file metadata for content-type
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files.length) {
      return res.status(404).json({ success: false, message: 'Photo file not found.' });
    }

    res.set('Content-Type', files[0].metadata?.mimetype || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400'); // 24h cache

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on('error', () =>
      res.status(404).json({ success: false, message: 'Error streaming photo.' })
    );
    downloadStream.pipe(res);
  } catch (error) {
    console.error('servePhoto error:', error);
    res.status(500).json({ success: false, message: 'Server error serving photo.' });
  }
};

// ========================
// @POST /api/profile/resume
// @desc Upload / replace resume PDF
// @access Private
// ========================
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file provided.' });
    }

    const profile = await getOrCreateProfile();

    // Delete previous resume from GridFS
    if (profile.resumeFileId) {
      await deleteGridFSFile(profile.resumeFileId);
    }

    profile.resumeFileId    = req.file.id;
    profile.resumeFileName  = req.file.originalname || 'resume.pdf';
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully.',
      data: {
        fileId:      req.file.id,
        filename:    req.file.filename,
        originalName:req.file.originalname,
        downloadUrl: '/api/profile/resume/download',
      },
    });
  } catch (error) {
    console.error('uploadResume error:', error);
    res.status(500).json({ success: false, message: 'Server error uploading resume.' });
  }
};

// ========================
// @GET /api/profile/resume/download
// @desc Download resume PDF (public) + track count
// @access Public
// ========================
exports.downloadResume = async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile?.resumeFileId) {
      return res.status(404).json({ success: false, message: 'No resume found.' });
    }

    const bucket = getGFSBucket();
    const fileId = new mongoose.Types.ObjectId(profile.resumeFileId);

    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files.length) {
      return res.status(404).json({ success: false, message: 'Resume file not found.' });
    }

    // Increment download counter (fire and forget)
    Profile.findOneAndUpdate({}, { $inc: { resumeDownloadCount: 1 } }).catch(() => {});

    const filename = profile.resumeFileName || 'Ashish_Dwivedi_Resume.pdf';
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    res.set('Cache-Control', 'no-cache');

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on('error', () =>
      res.status(500).json({ success: false, message: 'Error streaming resume.' })
    );
    downloadStream.pipe(res);
  } catch (error) {
    console.error('downloadResume error:', error);
    res.status(500).json({ success: false, message: 'Server error downloading resume.' });
  }
};

// ========================
// @GET /api/profile/resume/info
// @desc Get resume metadata (name, download count)
// @access Private
// ========================
exports.getResumeInfo = async (req, res) => {
  try {
    const profile = await Profile.findOne().select(
      'resumeFileId resumeFileName resumeDownloadCount updatedAt'
    );

    res.status(200).json({
      success: true,
      data: {
        hasResume:     !!profile?.resumeFileId,
        filename:      profile?.resumeFileName || null,
        downloadCount: profile?.resumeDownloadCount || 0,
        uploadedAt:    profile?.updatedAt || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching resume info.' });
  }
};

// ========================
// @DELETE /api/profile/photo
// @desc Remove profile photo
// @access Private
// ========================
exports.deletePhoto = async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile?.photoFileId) {
      return res.status(404).json({ success: false, message: 'No photo to delete.' });
    }

    await deleteGridFSFile(profile.photoFileId);
    profile.photoFileId = null;
    await profile.save();

    res.status(200).json({ success: true, message: 'Profile photo removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting photo.' });
  }
};

// ========================
// @DELETE /api/profile/resume
// @desc Remove resume
// @access Private
// ========================
exports.deleteResume = async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile?.resumeFileId) {
      return res.status(404).json({ success: false, message: 'No resume to delete.' });
    }

    await deleteGridFSFile(profile.resumeFileId);
    profile.resumeFileId   = null;
    profile.resumeFileName = '';
    await profile.save();

    res.status(200).json({ success: true, message: 'Resume removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting resume.' });
  }
};
