const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  name: String,
  wikidataEntity: Number,
  originalFilename: String,
  fileSize: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Image = mongoose.model('Image', imageSchema);
module.exports = Image;
