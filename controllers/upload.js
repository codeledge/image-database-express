/**
 * GET /api/upload
 * File Upload API example.
 */
const wdk = require('wikidata-sdk');
const fs = require('fs');
const request = require('request');
const crypto = require('crypto');

const {
  simplify, parse, isEntityId, isPropertyId, getNumericId
} = require('wikibase-sdk');
const getItem = require('./wikidata/getItem');
const Image = require('../models/Image');

function getRandomFilename() {
  return crypto.randomBytes(20).toString('hex');
}

const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', callback);
  });
};

exports.getFileUpload = (req, res) => {
  res.render('api/upload', {
    title: 'File Upload',
    // query: req.query
  });
};

exports.handleSourceUrl = async (req, res, next) => {
  if (!req.file) {
    if (req.body.sourceUrl) {
      try {
        const file = getRandomFilename();
        download(req.body.sourceUrl, "uploads/" + file, () => {
          res.savedUrl = file;
          next();
        });
      } catch (err){
        req.flash('errors', { msg: 'URL invalid.' });
        res.redirect('/api/upload');
      }
    } else {
      req.flash('errors', { msg: 'No File is given.' });
      res.redirect('/api/upload');
    }
  } else {
    next();
  }
};

exports.postFileUpload = async (req, res, next) => {
  console.log(req.body);
  const wikidataId = req.body.wikidataEntityId;
  if (!isEntityId(wikidataId)) {
    req.flash('errors', { msg: 'The Entity ID ' + wikidataId + ' is invalid.' });
    res.redirect('/api/upload');
  }
  const wikidataInfo = await getItem([wikidataId], 'en');
  const label = wdk.simplify.labels(wikidataInfo[wikidataId].labels).en;
  // const claims = wdk.simplify.claims(wikidataInfo[wikidataId].claim);

  // console.log(wikidataInfo);
  let imageDetails = {
    name: req.body.name,
    wikidataEntity: getNumericId(wikidataId),
    wikidataLabel: label,
    // wikidataType: label,
    viewCount: 0
  };
  if (req.file) {
    imageDetails.mimetype = req.file.mimetype;
    imageDetails.internalFileName = req.file.filename;
    imageDetails.originalFilename = req.file.originalname;
  } else {
    imageDetails.internalFileName = res.savedUrl;
    imageDetails.mimetype = 'image/jpeg';
  }

  const image = new Image(imageDetails);
  console.log('sdf');
  image.save((err) => {
    if (err) {
      console.log(err);
      // return next(err);
      req.flash('errors', { msg: 'Entry couldn\'t be saved' });
      res.redirect('/api/upload');
    }
  });
  const wikidataLink = wdk.getSitelinkUrl({ site: 'wikidata', title: wikidataId });
  req.flash('success', { msg: `File was uploaded successfully <a href="${wikidataLink}">link</a> and entered into the DBs.` });
  res.redirect('/api/upload');
};
