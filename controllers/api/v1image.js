/**
 * VERSION 1 of the API
 * 2020 October
 * do not make big changes
 */
const ImageModel = require('../../models/Image');
const path = require('path');

exports.showImageByWikidata = async (req, res) => {
  const { id, type } = req.params;
  // if (!Number.isInteger(id)) { //already checked at app.js
  //   res.json({ error: 'Only numbers allowed' });
  // }
  const allowedTypes = ['thumbnail','facecrop','original'];
  if (allowedTypes.indexOf(type) === -1){
      res.json({ error: true, errorMessage: 'Type not allowed' });
  }
  const image = await ImageModel.find({ wikidataEntity: id }, null, { sort: { name: 1 }, limit: 1 });
  if (!image.length) {
    res.sendStatus(404);
    // res.json({ error: 404 });
  }
  if ( !image[0].mimetype) {
    res.json({ error: true, errorMessage: 'mimetype', entry: image });
  }

  await ImageModel.updateOne( {_id:image[0]._id} , {viewCount:(image[0].viewCount+1)} );

  res.setHeader('content-type', image[0].mimetype);
  res.sendFile(path.resolve('uploads/'+type+'/' + image[0].id));
};

exports.showImageById  = async (req, res) => {
  const { id, type } = req.params;
  let { factor } = req.query;

  let ext = '';
  if(type === 'facecrop'){
    if(!factor){
      factor = 1;
    }
    factor = parseFloat(factor).toFixed(1);
    if(factor < 1 || factor > 1.75 ){
      res.json({error:true,errorMsg:'factor invalid'});
    }
    ext = (factor ? '-'+ parseFloat(factor).toFixed(1) : '');
  }
  res.setHeader('content-type', "image/jpeg");
  res.sendFile(path.resolve('uploads/'+type+'/' + id + ext));
};


exports.imageInfo = async (req, res) => {
  const { id } = req.params;
  const image = await ImageModel.find({ wikidataEntity: id }, null, { sort: { name: 1 }, limit: 1 });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({images:image});
};