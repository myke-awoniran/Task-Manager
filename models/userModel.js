const Mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const errorController = require('../controllers/errorController');
const userSchema = Mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [10, 'minimum name character is 10'],
    maxlength: [40, 'name must not exceed 40 character'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
    minlength: [8, 'minimum password character is 8 '],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function () {
        return this.password === this.passwordConfirm;
      },
      message: 'Password Does not match',
    },
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  tasks: [
    {
      type: Mongoose.Schema.ObjectId,
      ref: 'Task',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  displayPhoto: String,
  role: {
    enum: ['user', 'admin'],
    message: 'you can either by normal user or an admin',
    type: String,
    default: 'user',
  },
});

userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.CheckPassword = async function (password, userpassword) {
  return await bcrypt.compare(password, userpassword);
};

userSchema.methods.changedPassword = async function (tokenIssuedTime) {
  if (this.passwordChangedAt) {
    const timeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return timeStamp > tokenIssuedTime;
  }
  return false;
};
userSchema.methods.generatePasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 600000;
  return resetToken;
};
const User = Mongoose.model('User', userSchema);
module.exports = User;
