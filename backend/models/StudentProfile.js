const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  studentId: String,
  department: String,
  year: String,
  semester: String
});

module.exports = mongoose.models.StudentProfile || mongoose.model("StudentProfile", studentProfileSchema);
