import { useEffect, useState } from "react";
import axios from "axios";
import { FiHome, FiLogOut, FiCheckSquare, FiSearch, FiX } from "react-icons/fi";
import "./adminDashboard.css";

function FacultyDashboard() {
  const [facultyName, setFacultyName] = useState("");
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [feedbacks, setFeedbacks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [studentIdByEmail, setStudentIdByEmail] = useState({});
  const [reviewSearch, setReviewSearch] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("fullName");
    if (name) setFacultyName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  const fetchFeedback = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback/all");
      setFeedbacks(res.data);

      const emails = Array.from(new Set(res.data.map(f => f.email).filter(Boolean)));
      if (emails.length) {
        const profileResults = await Promise.all(
          emails.map(email =>
            axios
              .get(`http://localhost:5000/api/student/profile/${encodeURIComponent(email)}`)
              .then(r => ({ email, studentId: r.data?.studentId }))
              .catch(() => ({ email, studentId: undefined }))
          )
        );
        const map = {};
        profileResults.forEach(item => {
          if (item.email) map[item.email] = item.studentId;
        });
        setStudentIdByEmail(map);
      } else {
        setStudentIdByEmail({});
      }
    } catch (error) {
      console.log(error);
    }
  };

  const applyFacultyFilter = () => {
    const name = (facultyName || "").trim().toLowerCase();
    let data = [...feedbacks];
    if (name) {
      data = data.filter(f => {
        const faculty = (f.faculty || f.facultyName || "").trim().toLowerCase();
        return faculty === name || faculty.includes(name);
      });
    }
    setFiltered(data);
  };

  useEffect(() => { fetchFeedback(); }, []);

  useEffect(() => {
    applyFacultyFilter();
  }, [feedbacks, facultyName]);

  const getReviewStatus = (item) => {
    return (item.response || "").trim().length > 0;
  };

  const handleReviewSubmit = async () => {
    if (!selectedFeedback) return;
    try {
      await axios.patch(`http://localhost:5000/api/feedback/${selectedFeedback._id}`, {
        status: "Reviewed",
        response: response
      });

      setFeedbacks(prev => prev.map(f => f._id === selectedFeedback._id ? { ...f, status: "Reviewed", response } : f));
      alert("Response sent successfully!");
      setSelectedFeedback(null);
      setResponse("");
    } catch (error) {
      console.error(error);
      alert("Error saving response.");
    }
  };

  const getRatingClass = (rating) => {
    if (!rating) return "";
    const r = rating.toLowerCase().trim();
    if (r === "excellent") return "rating-excellent";
    if (r === "very good") return "rating-very-good";
    if (r === "good") return "rating-good";
    if (r === "fair") return "rating-fair";
    if (r === "poor") return "rating-poor";
    return "";
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Main Menu</h3>
        <ul>
          <li className={activeMenu === "dashboard" ? "active-link" : ""} onClick={() => setActiveMenu("dashboard")}><FiHome /> Dashboard</li>
          <li className={activeMenu === "reviewFeedback" ? "active-link" : ""} onClick={() => setActiveMenu("reviewFeedback")}><FiCheckSquare /> Review Feedback</li>
          <li className="logout-item" onClick={handleLogout} style={{ cursor: "pointer" }}><FiLogOut /> Logout</li>
        </ul>
      </div>

      <div className="main-content">
        {activeMenu === "dashboard" && (
          <>
            <div className="admin-header-flex">
              <h2>Faculty Dashboard</h2>
            </div>
            <div className="view-feedback-section">
              <h3>Welcome, {facultyName || "Faculty"}</h3>
            </div>
          </>
        )}

        {activeMenu === "reviewFeedback" && (
          <div className="view-feedback-section">
            <div className="filter-bar-container">
              <div className="filter-search-block">
                <FiSearch color="#94a3b8" />
                <input type="text" placeholder="Search feedback..." value={reviewSearch} onChange={e => setReviewSearch(e.target.value)} />
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Student ID</th><th>Feedback Type</th><th>Course</th><th>Date & Time</th><th>Rating</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {filtered
                    .filter(f => (f.title || "").toLowerCase().includes(reviewSearch.toLowerCase()))
                    .map(item => {
                      const isReviewed = getReviewStatus(item);
                      return (
                        <tr key={item._id}>
                          <td className="td-student">{studentIdByEmail[item.email] || "N/A"}</td>
                          <td className="td-type">{item.feedbackType || item.type || "N/A"}</td>
                          <td className="td-course">{item.title || "N/A"}</td>
                          <td className="td-date">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}</td>
                          <td className={`td-rating ${getRatingClass(item.rating)}`}>{item.rating || "N/A"}</td>
                          <td>
                            <span className={`status-pill ${isReviewed ? "reviewed" : "pending"}`}>
                              {isReviewed ? "Reviewed" : "Pending"}
                            </span>
                          </td>
                          <td>
                            <button className="filter-btn-white" onClick={() => setSelectedFeedback(item)}>
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedFeedback && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h2>Review Feedback: {selectedFeedback.title || "Feedback"}</h2>
                <button className="close-btn" onClick={() => setSelectedFeedback(null)}><FiX /></button>
              </div>
              <div className="modal-body">
                <div className="feedback-meta">
                  <div><label>Student ID</label><p>{studentIdByEmail[selectedFeedback.email] || "N/A"}</p></div>
                  <div><label>Feedback Type</label><p>{selectedFeedback.feedbackType || selectedFeedback.type || "N/A"}</p></div>
                  <div><label>Course</label><p>{selectedFeedback.title || "N/A"}</p></div>
                  <div><label>Date & Time</label><p>{selectedFeedback.createdAt ? new Date(selectedFeedback.createdAt).toLocaleString() : "N/A"}</p></div>
                </div>
                <div className="field-group">
                  <label>Suggestion</label>
                  <div className="suggestion-display">{selectedFeedback.suggestions || "No suggestion provided."}</div>
                </div>
                <div className="field-group">
                  <label>Response</label>
                  <div className="suggestion-display">{selectedFeedback.response || "No response yet"}</div>
                </div>
                <div className="field-group">
                  <label>Responded At</label>
                  <div className="suggestion-display">{selectedFeedback.responseAt ? new Date(selectedFeedback.responseAt).toLocaleString() : "N/A"}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setSelectedFeedback(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FacultyDashboard;
