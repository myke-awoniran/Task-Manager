const Task = require('../models/taskModel');
const catchAsync = require('../utils/catchAsync');
const { response } = require('../utils/response');

exports.getAllTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.find();
  response(200, tasks, res);
  next();
});
exports.getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id).select('-__v');
  response(200, task, res);
  next();
});

exports.createNewTask = catchAsync(async (req, res, next) => {
  const task = await Task.create(req.body);
  response(200, task, res);
  task.save();
  next();
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndUpdate(req.params.id);
  response(200, task, res);
  next();
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  response(204, task, res);
  next();
});
