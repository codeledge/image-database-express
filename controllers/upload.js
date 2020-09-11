/**
 * GET /api/upload
 * File Upload API example.
 */
const wdk = require('wikidata-sdk');
const {
  simplify, parse, isEntityId, isPropertyId, getNumericId
} = require('wikibase-sdk');
const getItem = require('./wikidata/getItem');
const Image = require('../models/Image');

exports.getFileUpload = (req, res) => {
  res.render('api/upload', {
    title: 'File Upload'
  });
};

exports.postFileUpload = (req, res, next) => {
  const wikidataId = req.body.wikidataEntityId;
  if (!isEntityId(wikidataId)) {
    req.flash('errors', { msg: 'The Entity ID is invalid.' });
    res.redirect('/api/upload');
  }
  const wikidataInfo = getItem(wikidataId);
  console.log(wikidataInfo);
  const image = new Image({
    name: 'TestNAme',
    wikidataEntity: getNumericId(wikidataId),
    wikidataLabel: '',
    internalFileName: req.file,
    originalFilename: req.body.wikidataEntity,
    viewCount: 0
  });
  console.log('sdf');
  image.save((err) => {
    if (err) {
      console.log(err);
      // return next(err);
    }
    // req.logIn(user, (err) => {
    //   if (err) {
    //     return next(err);
    //   }
    //   res.redirect('/');
    // });
  });
  const wikidataLink = wdk.getSitelinkUrl({ site: 'wikidata', title: wikidataId });
  req.flash('success', { msg: `File was uploaded successfully <a href="${wikidataLink}">link</a> and entered into the DBs.` });
  res.redirect('/api/upload');
};
