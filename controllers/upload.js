/**
 * GET /api/upload
 * File Upload API example.
 */
const wdk = require('wikidata-sdk');
const fs = require('fs');
const request = require('request');
const crypto = require('crypto');
const sharp = require('sharp');

const {
  simplify, parse, isEntityId, isPropertyId, getNumericId
} = require('wikibase-sdk');
const getItem = require('./wikidata/getItem');
const getRelatives = require('./wikidata/getRelatives');

const Image = require('../models/Image');

function getRandomFilename() {
  return crypto.randomBytes(20).toString('hex');
}

const download = async (url, path) => {
  await new Promise(resolve =>
    request.head(url, (err, res, body) => {
      request(url)
        .pipe(fs.createWriteStream(path))
        .on('close', resolve);
    })
  );
};

function createThumbnail(filename){
  console.log('Create thumb: uploads/' + filename);
  sharp('uploads/' + filename).resize(200).toFile('uploads/thumbnails/' + filename, (err, resizeImage) => {
    if (err) {
      console.log(err);
    } else {
      console.log(resizeImage);
    }
  });
}

exports.getMultiFileUpload = async (req, res) => {
  // res.send(req.params);

  if (!req.query.ids) {
    // req.flash('errors', { msg: 'Parameter ids is missing' });
    // res.redirect('/api/upload');
    res.render('image/multiUploadForm', {
      title: 'File Upload',
    });
  }
  const ids = req.query.ids.split(",");
  // for(let id in ids){
  //   if (!isEntityId(id)) {
  //     req.flash('errors', { msg: 'Some ids are invalid.' });
  //     res.redirect('/api/upload');
  //   }
  // }

  //
  const wikidataEntities = await getItem(ids, 'en');
  let entities = [];
  // for(var id, enty in wikidataEntities){
  for(var i in wikidataEntities) {
    var label = wdk.simplify.labels(wikidataEntities[i].labels).en;
    var claims = wdk.simplify.claims(wikidataEntities[i].claims);
    var existing = await Image.find({ wikidataEntity: getNumericId(i) }, null, { sort: { name: 1 }, limit: 1 });
    entities.push({
      id: i,
      link: wdk.getSitelinkUrl({ site: 'wikidata', title: i }),
      images: claims.P18,
      existing: existing,
      label: label,
    });
  }
  // const label = wdk.simplify.labels(wikidataInfo[wikidataId].labels).en;
  res.render('image/multiUpload', {
    title: 'File Upload',
    entities: entities
    // query: req.query
  });
};


exports.handlePersonSelect = async (req, res, next) => {

  //A person is selected, forward
  if(req.body.wikidataEntityId !== undefined){
    const response = await getRelatives(req.body.wikidataEntityId);
    const result = wdk.simplify.sparqlResults(response.data, { minimize: false });
    const ids = result.map(entry => {
      return entry.item.value;
    });
    res.redirect('/image/multi_upload?ids='+ids.slice(0,50).join(","));
  }
  next();

};

exports.handleMultiUrlUpload = async (req, res, next) => {

  const urls = req.body.sourceUrl;
  if(urls === undefined){
    req.flash('errors', {msg: 'Nothing.'});
    res.redirect(req.header('Referer') || '/');
  }
  const wikidataInfo = await getItem(Object.keys(urls), 'en');
  let uploadedCount = 0;
  for(let wikidataId in urls) {
    try {
      var file = getRandomFilename();
      var sourceUrl = urls[wikidataId];
      console.log("RAndom: "+file);
      if(sourceUrl) {
        // , () => {
          // res.savedUrl = file;
          let imageDetails = {
            wikidataEntity: getNumericId(wikidataId),
            wikidataLabel: wdk.simplify.labels(wikidataInfo[wikidataId].labels).en,
            sourceUrl: sourceUrl,
            internalFileName: file,
            // originalFilename: sourceUrl
            viewCount: 0
          };
          imageDetails.mimetype = 'image/jpeg';
          var image = new Image(imageDetails);
          var savedImage = await image.save();
          var savedImageId = savedImage.id;
          await download(sourceUrl, "uploads/" + savedImageId);
          createThumbnail(savedImageId);
          uploadedCount++;
        // });
        // next();
      }

    } catch (err) {
      req.flash('errors', {msg: 'URL invalid.'});
      res.redirect(req.header('Referer') || '/');
    }
  }
  req.flash('success', { msg: `${uploadedCount} files uploaded.` });
  res.redirect(req.header('Referer') || '/');

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
        await download(req.body.sourceUrl, "uploads/" + file);
        res.savedUrl = file;
        next();
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
    sourceUrl : req.body.sourceUrl,
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
  // image.save((err) => {
  //   if (err) {
  //     console.log(err);
  //     // return next(err);
  //     req.flash('errors', { msg: 'Entry couldn\'t be saved' });
  //     res.redirect('/api/upload');
  //   }
  // });
  var savedImage = await image.save();

  fs.rename('uploads/' + imageDetails.internalFileName, 'uploads/' +savedImage.id, function (err) {
    if (err) throw err;
    console.log('Successfully renamed - AKA moved!')
  });

  createThumbnail(savedImage.id);

  const wikidataLink = wdk.getSitelinkUrl({ site: 'wikidata', title: wikidataId });
  req.flash('success', { msg: `File was uploaded successfully <a href="${wikidataLink}">link</a> and entered into the DBs.` });
  res.redirect('/api/upload');
};
