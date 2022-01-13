const express = require('express');
const hpp = require('hpp');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const dataSanitizer = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const app = express();
const dotenv = require('dotenv').config({
  path: 'config.env',
});

const AppError = require('./utils/AppError');
const userRouter = require('./routes/userRoute');
const taskRouter = require('./routes/taskRoutes');
const errController = require('./controllers/errorController');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json(path.join(__dirname)));
app.use(helmet());
app.use(dataSanitizer());
app.use(xssClean());
app.use(hpp());
app.use(cookieParser());

app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});

app.use(errController.errorHandler);

module.exports = app;
