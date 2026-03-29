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
  status: { type: String, default: "pending" },
  response: { type: String, default: "" },
  responseAt: { type: Date, default: null },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
