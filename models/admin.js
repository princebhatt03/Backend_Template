const mongoose = require('../db/db');

const adminSchema = new mongoose.Schema(
  {
    adminName: { type: String, required: true },
    adminUsername: { type: String, unique: true, required: true },
    adminID: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
