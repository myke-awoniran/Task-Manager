const express = require('express');
const router = express.Router();
const taskControllers = require('../controllers/taskController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router
  .route('/')
  .get(taskControllers.getAllTasks)
  .post(taskControllers.createNewTask);
router
  .route('/:id')
  .patch(taskControllers.updateTask)
  .get(taskControllers.getTask)
  .delete(taskControllers.deleteTask);

module.exports = router;
