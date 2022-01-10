const catchAsync = require('../utils/catchAsync');
const { response } = require('../utils/response');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const errorController = require('../controllers/errorController');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password');
  response(200, users, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne(req.body.email);
  if (!user) {
    return next(new AppError('No user found with that email', 401));
  }

  next();
});

exports.updateme = catchAsync(async (req, res, next) => {});
