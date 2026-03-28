const express = require("express");
const bcrypt = require("bcryptjs");
const Faculty = require("../models/Faculty");

const router = express.Router();

// Add Faculty
router.post("/", async (req, res) => {
  try {
    console.log("Create Faculty Payload:", req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await Faculty.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Faculty already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const faculty = new Faculty({ name, email, password: hashedPassword });
    await faculty.save();

    res.status(201).json({ message: "Faculty created" });
  } catch (error) {
    console.log("Add Faculty Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
