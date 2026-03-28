const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Faculty = require("../models/Faculty");
const StudentProfile = require("../models/StudentProfile");

const router = express.Router();


// ================= REGISTER =================
router.post("/register", async (req, res) => {
  return res.status(403).json({ message: "Student self-registration is disabled. Please contact admin." });
});

router.post("/admin-create-student", async (req, res) => {
  try {
    const { fullName, studentId, password, department, year, semester } = req.body;

    if (!fullName || !studentId || !password || !department || !year || !semester) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ studentId });
    if (userExists) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      studentId,
      password: hashedPassword,
      role: "student"
    });
    await user.save();

    await StudentProfile.findOneAndUpdate(
      { email: studentId },
      { email: studentId, studentId, department, year, semester },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Student created successfully" });
  } catch (error) {
    console.log("Admin Create Student Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // 🔥 Admin Login (Hardcoded)
    if (studentId === "admin@gmail.com" && password === "bitsathy") {
      const token = jwt.sign(
        { id: "admin", role: "admin" },
        "secretkey",
        { expiresIn: "1d" }
      );

      return res.json({
        message: "Admin Login Successful",
        token,
        role: "admin"
      });
    }

    // Student Login
    const faculty = await Faculty.findOne({ email: studentId });
    if (faculty) {
      const isFacultyMatch = await bcrypt.compare(password, faculty.password);
      if (!isFacultyMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign(
        { id: faculty._id, role: "faculty" },
        "secretkey",
        { expiresIn: "1d" }
      );
      return res.json({
        message: "Login Successful",
        token,
        role: "faculty",
        fullName: faculty.name
      });
    }

    // Student Login
    const user = await User.findOne({ studentId });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login Successful",
      token,
      role: user.role,
      fullName: user.fullName
    });

  } catch (error) {
    console.log("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
