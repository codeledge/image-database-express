const User = require('../models/User');

exports.getUsers = (req, res) => {
  User.find((err, docs) => {
    res.render('admin/userList', { users: docs });
  });
};