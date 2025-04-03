const mongoose = require('../db/db');

const userSchema = mongoose.Schema({
  name: String,
  userID: String,
  email: String,
  password: String,
});

module.exports = mongoose.model('User', userSchema);
