const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

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
  uploadSite: String,
}, { timestamps: true });

imageSchema.plugin(AutoIncrement, {inc_field: 'id'});

const Image = mongoose.model('Image', imageSchema);
module.exports = Image;
