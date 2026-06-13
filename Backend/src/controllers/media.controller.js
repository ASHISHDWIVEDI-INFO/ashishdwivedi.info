const mongoose = require('mongoose');
const { getGFSBucket } = require('../config/gridfs');

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided.' });
    res.status(201).json({
      success: true,
      data: {
        fileId:   req.file.id,
        filename: req.file.filename,
        url:      `/api/media/${req.file.id}`,
        mimetype: req.file.mimetype,
        size:     req.file.size,
      },
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAllMedia = async (req, res) => {
  try {
    const bucket = getGFSBucket();
    const files  = await bucket.find({}).sort({ uploadDate: -1 }).limit(100).toArray();
    const data   = files.map(f => ({
      fileId:     f._id,
      filename:   f.filename,
      mimetype:   f.metadata?.mimetype || f.contentType || 'application/octet-stream',
      size:       f.length,
      uploadedAt: f.uploadDate,
      url:        `/api/media/${f._id}`,
    }));
    res.json({ success: true, total: data.length, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.serveMedia = async (req, res) => {
  try {
    const bucket = getGFSBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const files  = await bucket.find({ _id: fileId }).toArray();
    if (!files.length) return res.status(404).json({ success: false, message: 'File not found.' });
    const file = files[0];
    res.set('Content-Type', file.metadata?.mimetype || file.contentType || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=86400');
    const stream = bucket.openDownloadStream(fileId);
    stream.on('error', () => res.status(404).json({ success: false, message: 'Stream error.' }));
    stream.pipe(res);
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteMedia = async (req, res) => {
  try {
    const bucket = getGFSBucket();
    await bucket.delete(new mongoose.Types.ObjectId(req.params.id));
    res.json({ success: true, message: 'File deleted.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
