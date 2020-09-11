/**
 * GET /books
 * List all books.
 */
const ImageModel = require('../models/Images.js');

exports.getImages = (req, res) => {
  ImageModel.find((err, docs) => {
    res.render('images', { images: docs });
  });
};
