/**
 * GET /images
 * List all images.
 */
const ImageModel = require('../models/Image');

exports.getImages = (req, res) => {
  ImageModel.find((err, docs) => {
    res.render('image/list', { images: docs });
  });
};

exports.deleteAll = (req, res) => {
  if (req.body.deleteAll) {
    ImageModel.deleteMany({}, () => {
      req.flash('success', { msg: 'All entries deleted.' });
      res.redirect('/admin/images');
    });
  }
};

exports.showImageByWikidata = async (req, res) => {
  // console.log(req);
  // res.json({req:req.params.id});
  const { id } = req.params;
  const image = await ImageModel.find({ wikidataEntity: id }, null, { sort: { name: 1 }, limit: 1 });
  if (!image.length) {
    res.json({ error: 404 });
  }
  res.setHeader('content-type', 'image/jpeg');
  res.sendFile('/home/martin/workspace/images-world/uploads/' + image[0].internalFileName);//, { root: __dirname });
  // res.json({ req: image });
  // console.log(image[0].internalFileName);
};
