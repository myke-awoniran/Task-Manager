const Mongoose = require('mongoose');
const errorController = require('../controllers/errorController');

const taskSchema = Mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Task must have a name'],
    minlength: [8, 'task minimum length must be 8 characters'],
    maxlength: [40, 'task name must not exceed 40 characters'],
  },
  description: String,

  timeCreated: {
    type: Date,
    default: Date.now,
  },
  taskCompleted: Boolean,
});

const Task = Mongoose.model('Task', taskSchema);
module.exports = Task;
