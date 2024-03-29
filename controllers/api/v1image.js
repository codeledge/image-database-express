/**
 * VERSION 1 of the API
 * 2020 October
 * do not make big changes
 */
const ImageModel = require('../../models/Image');
const path = require('path');
const fs = require('fs');
const uploadController = require('../upload');
const removePhotoBg = require('./../removePhotoBg');

exports.showImageByWikidata = async (req, res) => {
  const { id, type } = req.params;
  // if (!Number.isInteger(id)) { //already checked at app.js
  //   res.json({ error: 'Only numbers allowed' });
  // }
  const allowedTypes = ['thumbnail', 'facecrop', 'original'];
  if (allowedTypes.indexOf(type) === -1) {
    res.json({ error: true, errorMessage: 'Type not allowed' });
  }
  const image = await ImageModel.find({ wikidataEntity: id }, null, { sort: { name: 1 }, limit: 1 });
  if (!image.length) {
    res.sendStatus(404);
    // res.json({ error: 404 });
  }
  if (!image[0].mimetype) {
    res.json({ error: true, errorMessage: 'mimetype', entry: image });
  }

  await ImageModel.updateOne({ _id: image[0]._id }, { viewCount: (image[0].viewCount + 1) });

  let { factor } = req.query;
  outputImage(res, image[0].id, type, factor, image[0].mimetype);
};

exports.showImageById = async (req, res) => {
  const { id, type } = req.params;
  let { factor } = req.query;
  outputImage(res, id, type, factor);
};

exports.removeBgById = async (req, res) => {
  const { id } = req.params;
  const output = await removePhotoBg.createImageWithoutBg(id);
  if (!output) {
    res.json({ error: true, errorMessage: 'problem removing bg' });
  }
  res.redirect("/api/v1/image/withoutBg/id/" + id);
};

function outputImage(res, id, type, factor, mimeType = "image/jpeg") {
  let ext = '';
  if (type === 'withoutBg') {
    const reqFile = 'uploads/' + type + '/' + id + "-1.7";//TODO 
    if (fs.existsSync(reqFile)) {
      console.log("exists");
      res.setHeader('content-type', mimeType);
      res.sendFile(path.resolve(reqFile));
    } else {
      // const output = removePhotoBg.createImageWithoutBg(id);
      // res.send(output);
      res.json({ error: true, errorMessage: 'no image found' });
    }
  }
  if (type === 'facecrop') {
    if (!factor) {
      factor = 1;
    }
    factor = parseFloat(factor).toFixed(1);
    if (factor < 1 || factor > 1.75) {
      res.json({ error: true, errorMsg: 'factor invalid' });
    }
    ext = (factor ? '-' + parseFloat(factor).toFixed(1) : '');
  }
  res.setHeader('content-type', mimeType);
  const reqFile = 'uploads/' + type + '/' + id + ext;
  if (fs.existsSync(reqFile)) {
    res.sendFile(path.resolve(reqFile));
  } else {
    res.sendFile(path.resolve('uploads/thumbnail/' + id));
  }
}


exports.imageInfo = async (req, res) => {
  const { id } = req.params;
  const image = await ImageModel.find({ wikidataEntity: id, uploadSite: req.hostname }, null, { sort: { name: 1 }, limit: 10 });
  if (!image.length) {
    // uploadController.uploadWikimediaFile(req,id);
    // const image = await ImageModel.find({ wikidataEntity: id }, null, { sort: { name: 1 }, limit: 1 });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ images: image });
};