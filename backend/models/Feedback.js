const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  studentName: String,
  department: String,
  year: String,
  type: String,
  title: String,
  faculty: String,
  rating: String,
  suggestions: String
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);