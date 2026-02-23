const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const feedbackRoutes = require("./routes/FeedbackRoutes");

const app = express();

// IMPORTANT
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});