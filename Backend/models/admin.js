const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  verificationTokenExpiry: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const adminModel = mongoose.model("Admin", adminSchema);
module.exports = adminModel;