const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  credits: { type: Number, default: 10 },
  revenue: { type: Number, default: 0 },
  role: { type: String, enum: ['User', 'Creator', 'admin'], default: 'User' },
  avatar: { type: String },
  language: { type: String, default: 'en' },
  referralCode: { type: String, unique: true, default: () => Math.random().toString(36).substring(2, 8).toUpperCase() },
  referralCount: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);