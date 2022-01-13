const Mongoose = require('mongoose');
const User = require('./userModel');

const taskSchema = Mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Task must have a name'],
    minlength: [8, 'task minimum length must be 8 characters'],
  },
  description: String,

  timeCreated: {
    type: Date,
    default: Date.now,
  },
  taskCompleted: Boolean,
  user: {
    type: Mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

const Task = Mongoose.model('Task', taskSchema);
module.exports = Task;
