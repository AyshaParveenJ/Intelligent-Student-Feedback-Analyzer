const express = require("express");
const Feedback = require("../models/Feedback");

const router = express.Router();

// SUBMIT FEEDBACK
router.post("/submit", async (req, res) => {
  try {
    const {
      studentName,
      email,
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
      email,
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

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET DASHBOARD STATS
router.get("/stats", async (req, res) => {
  try {
    const baseMatch = {};
    const faculty = (req.query.faculty || "").toString().trim();
    if (faculty) {
      const safe = escapeRegex(faculty);
      baseMatch.$or = [
        { faculty: { $regex: `^${safe}$`, $options: "i" } },
        { facultyName: { $regex: `^${safe}$`, $options: "i" } }
      ];
    }

    const total = await Feedback.countDocuments(baseMatch);
    const pending = await Feedback.countDocuments({ ...baseMatch, status: "pending" });
    const reviewed = await Feedback.countDocuments({ ...baseMatch, status: "reviewed" });

    res.json({ total, pending, reviewed });
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// UPDATE FEEDBACK (The missing part to fix your error)
router.patch("/:id", async (req, res) => {
  try {
    const {
      status,
      response,
      responseAt,
      reviewedAt,
      type,
      title,
      faculty,
      rating,
      suggestions
    } = req.body;

    const update = {};
    if (status !== undefined) update.status = String(status).toLowerCase().trim();
    if (response !== undefined) update.response = response;
    if (reviewedAt !== undefined) {
      update.reviewedAt = reviewedAt;
    }
    if (responseAt !== undefined) {
      update.responseAt = responseAt;
    } else if (response !== undefined) {
      update.responseAt = new Date();
    }
    if (update.status === "reviewed" && update.reviewedAt === undefined) {
      update.reviewedAt = new Date();
    }
    if (type !== undefined) update.type = type;
    if (title !== undefined) update.title = title;
    if (faculty !== undefined) update.faculty = faculty;
    if (rating !== undefined) update.rating = rating;
    if (suggestions !== undefined) update.suggestions = suggestions;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      update,
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

// DELETE FEEDBACK
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
