const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const feedbackRoutes = require("./routes/FeedbackRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const StudentProfile = require("./models/StudentProfile");

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/students", studentRoutes);

// --- NEW ROUTES START ---
app.post("/api/student/profile", async (req, res) => {
    try {
        const { email, studentId, department, year, semester } = req.body;
        const profile = await StudentProfile.findOneAndUpdate(
            { email }, 
            { email, studentId, department, year, semester }, 
            { upsert: true, new: true }
        );
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ error: "Failed to save" });
    }
});

app.get("/api/student/profile/:email", async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ email: req.params.email });
        if (profile) res.json(profile);
        else res.status(404).json({ message: "Not found" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
// --- NEW ROUTES END ---

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
