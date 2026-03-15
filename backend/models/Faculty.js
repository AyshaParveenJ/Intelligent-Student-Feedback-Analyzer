const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

module.exports = mongoose.model("Faculty", facultySchema);
