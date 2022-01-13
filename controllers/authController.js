const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const crypto = require('crypto');
const { response } = require('../utils/response');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
};

const sendToken = (currentUser, res, token) => {
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  currentUser.password = undefined;
  return jwt.sign({ currentUser: currentUser.id }, process.env.SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  let user = await User.create(req.body);
  const token = sendToken(user, res);
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
  const token = sendToken(user, res);
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

  await user.save({ validateBeforeSave: false });

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
  await user.save({ validateBeforeSave: true });
  const token = sendToken(user, res);
  return response(200, user, res, token);
});
