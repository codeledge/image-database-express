/**
 * GET /books
 * List all books.
 */
const ImageModel = require('../models/Image');

exports.getImages = (req, res) => {
  ImageModel.find((err, docs) => {
    res.render('image/list', { images: docs });
  });
};