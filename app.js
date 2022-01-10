const express = require('express');
const app = express();

const path = require('path');
const morgan = require('morgan');

const dotenv = require('dotenv').config({
  path: 'config.env',
});

const taskRouter = require('./routes/taskRoutes');
const userRouter = require('./routes/userRoute');
const errorController = require('./controllers/errorController');
const AppError = require('./utils/AppError');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(express.json(path.join(__dirname)));
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/users', userRouter);

app.use('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    Message: `can't find ${req.originalUrl} on this server`,
  });
  next();
});

app.use(errorController.errorHandler);

module.exports = app;
