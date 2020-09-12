const mongoose = require('mongoose');

//loosely based on https://schema.org/ImageObject
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
  author: String,
  comment: String,
  copyrightYear: Number,
  recordedDate: Date,
  viewCount: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Image = mongoose.model('Image', imageSchema);
module.exports = Image;
