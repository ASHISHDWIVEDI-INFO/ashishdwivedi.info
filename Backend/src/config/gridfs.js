const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gfsBucket;

const initGridFS = () => {
  mongoose.connection.once('open', () => {
    gfsBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: process.env.GRIDFS_BUCKET_NAME || 'uploads',
    });
    console.log('✅ GridFS bucket initialized');
  });
};

const getGFSBucket = () => {
  if (!gfsBucket) {
    throw new Error('GridFS bucket not initialized. Call initGridFS() first.');
  }
  return gfsBucket;
};

module.exports = { initGridFS, getGFSBucket };