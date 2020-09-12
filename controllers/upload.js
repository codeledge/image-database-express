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
    title: 'File Upload',
    // query: req.query
  });
};

exports.postFileUpload = async (req, res, next) => {
  console.log(req.body);
  const wikidataId = req.body.wikidataEntityId;
  if (!req.file) {
    req.flash('errors', { msg: 'No File is given.' });
    res.redirect('/api/upload');
  }
  if (!isEntityId(wikidataId)) {
    req.flash('errors', { msg: 'The Entity ID ' + wikidataId + ' is invalid.' });
    res.redirect('/api/upload');
  }
  const wikidataInfo = await getItem([wikidataId], 'en');
  const label = wdk.simplify.labels(wikidataInfo[wikidataId].labels).en;
  // const claims = wdk.simplify.claims(wikidataInfo[wikidataId].claim);

  console.log(wikidataInfo);
  // console.log(labels);
  const image = new Image({
    name: req.body.name,
    wikidataEntity: getNumericId(wikidataId),
    wikidataLabel: label,
    // wikidataType: label,
    mimetype: req.file.mimetype,
    internalFileName: req.file.filename,
    originalFilename: req.file.originalname,
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
