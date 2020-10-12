const User = require('../models/User');
const Image = require('../models/Image');

exports.getUsers = (req, res) => {
  User.find((err, docs) => {
    res.render('admin/userList', { users: docs });
  });
};


exports.setNewHost = async (req, res) => {
  await Image.updateMany({},
    {"uploadSite": "images.dataprick.com"});
  req.flash('success', { msg: 'Host has been set.' });
  res.redirect('/admin/images');
};