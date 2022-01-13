const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} :${err.value}`;
  return new AppError(message, 400);
};

const handleMongoError = (err) => {
  const message = `Duplicate field(s), Please use another value `;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errorsString = Object.values(err.errors).map((error) => error.message);
  const message = `validation fail : ${errorsString.join('.  ')}`;
  return new AppError(message, 400);
};

const handleTokenError = (err) => {
  const message = `Invalid token. Please login again!!!`;
  return new AppError(message, 400);
};

const handleExpiredToken = (err) => {
  const message = `Your token has expired, try to login again`;
  return new AppError(message, 400);
};

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    name: err.name,
    Message: err.message,
    stack: err.stack,
  });
};

const sendErrProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      Message: err.message,
    });
  } else {
    res.status(err.statusCode).json({
      status: 500,
      Message: `Something isn't working, Please Try again later while we work on it`,
    });
  }
};

exports.errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, dev);
  }
};

exports.errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleMongoError(err);
    if (err.name === 'JsonWebTokenError') error = handleTokenError(err);
    if (err.name === 'TokenExpiredError') error = handleExpiredToken(err);
    sendErrProd(error, res);
  }
};
