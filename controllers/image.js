const ImageModel = require('../models/Image');
const fs = require('fs');
const path = require('path');
const uploadController = require('./upload');

/**
 * GET /images
 * List all images.
 */
exports.getImages = (req, res) => {
  ImageModel
    .find({uploadSite: req.hostname})
    .populate('createdBy')
    .exec((err, docs) => {
    res.render('image/list', { images: docs, imageHeight: 40 });
  });
};

/**
 * GET /images/preview
 * List all images.
 */
 exports.getImagesPreview = (req, res) => {
  ImageModel
    .find({})//uploadSite: req.hostname
    .populate('createdBy')
    .limit(10)
    .exec((err, docs) => {
    res.render('image/preview', { images: docs, imageHeight: 40 });
  });
};

function deleteFilesById(id){
  fs.unlinkSync('uploads/original/' + id);
  fs.unlinkSync('uploads/thumbnail/' + id);
  for(let factor = 1; factor <= 1.8; factor = factor + 0.1) {
    fs.unlinkSync('uploads/facecrop/' + id+ '-' + factor.toFixed(1));
  }
  return true;
}

exports.deleteImage = (req, res) => {

  if(!req.user || req.user.role !== 'admin'){
    return;
  }

  const id = req.params.id;
  ImageModel.deleteOne(
    { id: id },
    (err) => {
      if(err){
        req.flash('errors', { msg: 'Entry couldn\'t be deleted.' });
      }else{
        req.flash('success', { msg: 'Entry has been deleted.' });
        try {
          deleteFilesById(id);
        }catch (e) {
          console.log(e);
          req.flash('errors', { msg: 'Some images (Id:'+id+') couldn\'t be deleted' });
        }
      }
      res.redirect('/admin/images');
    }
  );
};


exports.deleteAllWikimediaImages = (req, res) => {

  if(!req.user || req.user.role !== 'admin'){
    req.flash('errors', { msg: 'No permission.' });
    res.redirect('/admin/images');
    return;
  }

  if (true) {
    ImageModel.find({uploadSite: req.hostname,sourceName: "commons.wikimedia.org"}, (err, rows) => {

      if(rows.length) {
        ImageModel.deleteMany({uploadSite: req.hostname, sourceName: "commons.wikimedia.org"}, () => {
          for (var row in rows) {
            try {
              deleteFilesById(rows[row].id);
            } catch (e) {
              console.log(e);
              req.flash('errors', {msg: 'Some images (Id:' + rows[row].id + ') couldn\'t be deleted'});
            }
          }
          req.flash('success', {msg: 'All entries from Wikimedia deleted.'});
          res.redirect('/admin/images');
        });
      }
      req.flash('success', {msg: 'No entries found.'});
      res.redirect('/admin/images');
    });
  }
};
/*
Clears the database,
TODO disable
 */
exports.deleteAll = (req, res) => {

  if (false) {

    ImageModel.deleteMany({uploadSite: req.hostname}, () => {
      req.flash('success', { msg: 'All entries deleted.' });

      // const directory = 'uploads';
      //
      // fs.readdir(directory, (err, files) => {
      //   if (err) throw err;
      //
      //   for (const file of files) {
      //     fs.unlink(path.join(directory, file), err => {
      //       if (err) throw err;
      //     });
      //   }
      // });

      res.redirect('/admin/images');
    });
  }
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

  await ImageModel.updateOne( {_id:image[0]._id} , {viewCount:(image[0].viewCount+1)} );

  res.setHeader('content-type', image[0].mimetype);
  res.sendFile(path.resolve('uploads/thumbnail/' + image[0].id));
  // res.json({ req: image });
  // console.log(image[0].internalFileName);
};
exports.showImageById  = async (req, res) => {
  const { id } = req.params;
  res.setHeader('content-type', "image/jpeg");
  res.sendFile(path.resolve('uploads/thumbnail/' + id));
};


exports.imageInfo = async (req, res) => {
  const { id } = req.params;
  const image = await ImageModel.find({ wikidataEntity: id }, null, { sort: { name: 1 }, limit: 1 });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({images:image});
};