const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const { response } = require('../utils/response');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password');
  response(200, users, res);
});
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ id: req.params.id });
  response(200, user, res);
});
