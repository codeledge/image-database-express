/**
 * GET /images
 * List all images.
 */
const ImageModel = require('../models/Image');
const fs = require('fs');
const path = require('path');

exports.getImages = (req, res) => {
  ImageModel.find((err, docs) => {
    res.render('image/list', { images: docs });
  });
};

exports.deleteAll = (req, res) => {
  // if (req.body.deleteAll) {

    ImageModel.deleteMany({}, () => {
      req.flash('success', { msg: 'All entries deleted.' });
      res.redirect('/admin/images');
    });
  // }
};

exports.showImageByWikidata = async (req, res) => {
  const { id } = req.params;
  // if (!Number.isInteger(id)) { //already checked at app.js
  //   res.json({ error: 'Only numbers allowed' });
  // }
  const image = await ImageModel.find({ wikidataEntity: id }, null, { sort: { name: 1 }, limit: 1 });
  if (!image.length) {
    res.sendStatus(404);
    // res.json({ error: 404 });
  }
  if ( !image[0].mimetype) {
    res.json({ error: 'mimetype', entry: image });
  }
  res.setHeader('content-type', image[0].mimetype);
  res.sendFile(path.resolve('uploads/thumbnails/' + image[0].id));
  // res.json({ req: image });
  // console.log(image[0].internalFileName);
};
exports.showImageById  = async (req, res) => {
  const { id } = req.params;
  res.setHeader('content-type', "image/jpeg");
  res.sendFile(path.resolve('uploads/thumbnails/' + id));
};