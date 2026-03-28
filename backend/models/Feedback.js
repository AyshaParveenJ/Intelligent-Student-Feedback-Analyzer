const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  studentName: String,
  email: String,
  department: String,
  year: String,
  type: String,
  title: String,
  faculty: String,
  rating: String,
  suggestions: String,
  // Add these lines so the database accepts the new data
  status: { type: String, default: "Pending" },
  response: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
