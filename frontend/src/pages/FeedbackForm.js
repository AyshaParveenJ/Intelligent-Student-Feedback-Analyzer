import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./FeedbackForm.css";

function FeedbackForm({ type }) {

  const navigate = useNavigate(); // 🔥 Added

  const [title, setTitle] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [rating, setRating] = useState("");
  const [suggestions, setSuggestions] = useState("");

  const suggestionOptions = {
    Academic: ["Machine Learning","Artificial Intelligence","Operating Systems","DevOps"],
    Training: ["Highend","Bytes","PBL"],
    Skills: ["C","Java","Python"],
    Events: ["Lecture Meeting","Orientation","Club Activities"]
  };

  const handleSubmit = async () => {

    if (!title || !facultyName || !rating) {
      alert("Please fill all required fields");
      return;
    }

    try {

      const studentName = localStorage.getItem("fullName");
      const department = localStorage.getItem("department");
      const year = localStorage.getItem("year");

      await axios.post("http://localhost:5000/api/feedback/submit", {
        studentName,
        department,
        year,
        type,
        title,
        faculty: facultyName,
        rating,
        suggestions
      });

      alert(`${type} Feedback Submitted Successfully ✅`);

      // Clear fields
      setTitle("");
      setFacultyName("");
      setRating("");
      setSuggestions("");

      // 🔥 Redirect to Dashboard
      navigate("/dashboard");

    } catch (error) {
      console.log(error);
      alert("Error submitting feedback");
    }
  };

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <h2>{type} Feedback</h2>

        <label>{type} Name</label>
        <input
          type="text"
          list="suggestions"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Enter ${type} Name`}
        />

        <datalist id="suggestions">
          {suggestionOptions[type]?.map((item, index) => (
            <option key={index} value={item} />
          ))}
        </datalist>

        <label>Faculty Name</label>
        <input
          type="text"
          value={facultyName}
          onChange={(e) => setFacultyName(e.target.value)}
        />

        <label>Rating</label>
        <div className="rating-group">
          {["Poor", "Fair", "Good", "Very Good", "Excellent"].map((rate) => (
            <label key={rate} className="rating-option">
              <input
                type="radio"
                name="rating"
                value={rate}
                checked={rating === rate}
                onChange={(e) => setRating(e.target.value)}
              />
              {rate}
            </label>
          ))}
        </div>

        <label>Suggestions</label>
        <textarea
          value={suggestions}
          onChange={(e) => setSuggestions(e.target.value)}
        />

        <button onClick={handleSubmit}>
          SUBMIT FEEDBACK
        </button>
      </div>
    </div>
  );
}

export default FeedbackForm;