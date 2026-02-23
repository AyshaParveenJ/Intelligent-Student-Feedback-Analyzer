const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();


// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { fullName, studentId, password } = req.body;

    if (!fullName || !studentId || !password) {
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

    res.status(201).json({ message: "Account Created Successfully" });

  } catch (error) {
    console.log("Register Error:", error);
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