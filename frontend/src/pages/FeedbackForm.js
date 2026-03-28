import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./FeedbackForm.css";

function FeedbackForm({ type }) {

  const navigate = useNavigate(); // ðŸ”¥ Added

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [rating, setRating] = useState("");
  const [suggestions, setSuggestions] = useState("");

  const titleOptions = {
    Academic: ["Artificial Intelligence", "Machine Learning", "DevOps", "OOPS", "Cloud", "Manual Entry"],
    Training: ["UAL", "PBL", "Bytes", "High End", "Manual Entry"],
    Skills: ["C", "Java", "Python", "Fullstack", "Manual Entry"],
    Events: [],
    Sports: ["Running", "High Jump", "Long Jump", "Manual Entry"],
    Hostel: ["Food", "Water", "Manual Entry"],
    Personal: []
  };

  const getTitleLabel = () => {
    if (category === "Academic") return "Course:";
    if (category === "Training") return "Training Type:";
    if (category === "Skills") return "Skill Course:";
    if (category === "Events") return "Event Name:";
    if (category === "Sports") return "Sports Category:";
    if (category === "Hostel") return "Issue Type:";
    if (category === "Personal") return "Regarding:";
    return "Title";
  };

  const getTitlePlaceholder = () => {
    if (category === "Academic") return "Enter Course:";
    if (category === "Training") return "Enter Training Type:";
    if (category === "Skills") return "Enter Skill Course:";
    if (category === "Events") return "Enter Event Name:";
    if (category === "Sports") return "Enter Sports Category:";
    if (category === "Hostel") return "Enter Issue Type:";
    if (category === "Personal") return "Enter Topic:";
    return "Enter Title";
  };

  const getFacultyLabel = () => {
    if (category === "Events") return "Organizer Name:";
    if (category === "Sports") return "Coach / Faculty Name:";
    if (category === "Hostel") return "Incharge Name:";
    return "Faculty Name";
  };

  const requiresFaculty = category && category !== "Personal";

  useEffect(() => {
    if (type) {
      setCategory(type);
      setTitle("");
      setFacultyName("");
      setRating("");
      setSuggestions("");
    }
  }, [type]);

  const handleSubmit = async () => {

    if (!category) {
      alert("Please select a category");
      return;
    }

    if (!title || !rating || (requiresFaculty && !facultyName)) {
      alert("Please fill all required fields");
      return;
    }

    try {

      const studentName = localStorage.getItem("fullName");
      const email = localStorage.getItem("loginEmail");
      const department = localStorage.getItem("department");
      const year = localStorage.getItem("year");
      await axios.post("http://localhost:5000/api/feedback/submit", {
        studentName,
        email,
        department,
        year,
        type: category,
        title,
        faculty: facultyName,
        rating,
        suggestions
      });

      alert(`${category} Feedback Submitted Successfully`);

      // Clear fields
      setCategory("");
      setTitle("");
      setFacultyName("");
      setRating("");
      setSuggestions("");

      // ðŸ”¥ Redirect to Dashboard
      navigate("/dashboard");

    } catch (error) {
      console.log(error);
      alert("Error submitting feedback");
    }
  };

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <h2>{category ? `${category} Feedback`.toUpperCase() : "Feedback"}</h2>

        {category && (
          <div>
            <label>{getTitleLabel()}</label>
            <input
              type="text"
              list="title-options"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={getTitlePlaceholder()}
            />

            <datalist id="title-options">
              {titleOptions[category]?.map((item, index) => (
                <option key={index} value={item} />
              ))}
            </datalist>

            {requiresFaculty && (
              <>
                <label>{getFacultyLabel()}</label>
                <input
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                />
              </>
            )}

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
        )}
      </div>
    </div>
  );
}

export default FeedbackForm;
