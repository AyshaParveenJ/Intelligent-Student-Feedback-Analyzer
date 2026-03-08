const express = require("express");
const Feedback = require("../models/Feedback");

const router = express.Router();

// SUBMIT FEEDBACK
router.post("/submit", async (req, res) => {
  try {
    const {
      studentName,
      department,
      year,
      type,
      title,
      faculty,
      rating,
      suggestions
    } = req.body;

    const newFeedback = new Feedback({
      studentName,
      department,
      year,
      type,
      title,
      faculty,
      rating,
      suggestions,
      status: "pending", // Default status when created
      response: ""       // Default response
    });

    await newFeedback.save();

    res.status(201).json({ message: "Feedback Submitted Successfully" });

  } catch (error) {
    console.log("Error saving feedback:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET ALL FEEDBACK
router.get("/all", async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// UPDATE FEEDBACK (The missing part to fix your error)
router.patch("/:id", async (req, res) => {
  try {
    const { status, response } = req.body;
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status, response },
      { new: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(updatedFeedback);
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;