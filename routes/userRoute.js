const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { getAllTasks, createNewTask } = require('../controllers/taskController');

userRouter.route('/signup').post(authController.signup);
userRouter.route('/login').post(authController.login);
userRouter.route('/forgotPassword').post(authController.forgotPassword);
userRouter.route('/resetPassword/:token').patch(authController.resetPassword);

userRouter
  .route('/')
  .get(
    authController.protect,
    authController.restrictedTo('admin'),
    userController.getAllUsers
  );
userRouter.get('/:id', userController.getUser);

userRouter.use('/:id/tours', createNewTask);

module.exports = userRouter;
