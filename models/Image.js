const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  name: String,
  wikidataEntity: Number,
  wikidataLabel: String,
  internalFileName: String,
  originalFilename: String,
  mimetype: String,
  license: String,
  sourceUrl: String,
  fileSize: Number,
  viewCount: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Image = mongoose.model('Image', imageSchema);
module.exports = Image;
