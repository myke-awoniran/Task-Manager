const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const Task = require('../models/taskModel');
const errorController = require('../controllers/errorController');

const { response } = require('../utils/response');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const sendToken = (currentUser) => {
  return jwt.sign({ currentUser: currentUser.id }, process.env.SECRET, {
    expiresIn: process.env.JWTEXPIRES,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  let user = await User.create(req.body);
  const token = sendToken(user);
  response(201, user, res, token);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('kindly provide valid username or password', 401));
  }
  let user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.CheckPassword(password, user.password))) {
    return next(new AppError('invalid username or password', 401));
  }
  const token = sendToken(user);
  response(200, user, res, token);
});

exports.protect = catchAsync(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    var token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('you are not logged in, login to get access'),
      401
    );
  }
  const currentUser = jwt.verify(token, process.env.SECRET);
  let user = await User.findById(currentUser.currentUser);
  if (!user) {
    return next(
      new AppError('This user with this token no longer not exist'),
      401
    );
  }
  if (await user.changedPassword(currentUser.iat)) {
    return next(
      new AppError('user recently change password, login to get access', 401)
    );
  }
  req.user = user;
  next();
});

exports.restrictedTo = (...roles) =>
  catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You are not permitted to perform this action'));
    }
    next();
  });

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }
  const resetToken = user.generatePasswordResetToken();

  await user.save({ valdateBeforeSave: false });
  const resetURL = `${req.protocol}//:${req.get(
    'host'
  )}/api/v1/users/resetPassword/${await resetToken}`;
  const message = `Forgot your password? submit a PATCH request with  your new password and passwordConfirm to ${resetURL}.\n If  you didn't forget your password, please ignore this message`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset Token (Valid for 10 minutes)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined);
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There is an error sending the Mail, Try again later!!', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  console.log(hashedToken);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current poassword is wrong'));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});
