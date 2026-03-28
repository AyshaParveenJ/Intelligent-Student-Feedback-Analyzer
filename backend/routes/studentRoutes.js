const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");

const router = express.Router();

// CREATE STUDENT (ADMIN)
router.post("/", async (req, res) => {
  try {
    console.log("Create Student Payload:", req.body);
    const { name, studentId, department, year, semester, email, password } = req.body;

    if (!name || !studentId || !department || !year || !semester || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ studentId: email });
    if (existing) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullName: name,
      studentId: email,
      password: hashedPassword,
      role: "student"
    });
    await user.save();

    await StudentProfile.findOneAndUpdate(
      { email },
      { email, studentId, department, year, semester },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Student created successfully" });
  } catch (error) {
    console.error("Create Student Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
