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

exports.deleteImage = (req, res) => {
  const id = req.params.id;
  ImageModel.remove(
    { id: id },
    (err) => {
      if(err){
        req.flash('errors', { msg: 'Entry couldn\'t be deleted.' });
      }else{
        req.flash('success', { msg: 'Entry has been deleted.' });
        fs.unlinkSync('uploads/' + id);
        fs.unlinkSync('uploads/thumbnails/' + id);
      }
      res.redirect('/admin/images');
    }
  );
};

/*
Clears the database,
TODO disable
 */
exports.deleteAll = (req, res) => {
  // if (req.body.deleteAll) {

    ImageModel.deleteMany({}, () => {
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

  await ImageModel.updateOne( {_id:image[0]._id} , {viewCount:(image[0].viewCount+1)} );

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


exports.imageInfo = async (req, res) => {
  const { id } = req.params;
  const image = await ImageModel.find({ wikidataEntity: id }, null, { sort: { name: 1 }, limit: 1 });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({images:image});
};