const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const taskRouter = require('./taskRoutes');

userRouter.route('/signup').post(authController.signup);
userRouter.route('/login').post(authController.login);
userRouter.route('/forgotPassword').post(userController.forgotPassword);

userRouter.use(authController.protect);

userRouter
  .route('/')
  .get(
    authController.protect,
    authController.restrictedTo('admin'),
    userController.getAllUsers
  );
userRouter.route('/updateMe').post(userController.updateme);

module.exports = userRouter;
