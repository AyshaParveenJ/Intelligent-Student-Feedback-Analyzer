import { useEffect, useState } from "react";
import axios from "axios";
import { FiHome, FiLogOut, FiCheckSquare, FiSearch, FiX, FiMessageSquare, FiStar, FiClock, FiUser, FiEdit } from "react-icons/fi";
import "./adminDashboard.css";

function FacultyDashboard() {
  const [facultyName, setFacultyName] = useState("");
  const [department, setDepartment] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [feedbacks, setFeedbacks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [studentIdByEmail, setStudentIdByEmail] = useState({});
  const [reviewSearch, setReviewSearch] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [historySelected, setHistorySelected] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("fullName");
    const dept = localStorage.getItem("department");
    if (name) setFacultyName(name);
    if (dept) setDepartment(dept);
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
      const responseAt = new Date().toISOString();
      await axios.patch(`http://localhost:5000/api/feedback/${selectedFeedback._id}`, {
        status: "Reviewed",
        response: response,
        responseAt: responseAt
      });

      setFeedbacks(prev => prev.map(f => f._id === selectedFeedback._id ? { ...f, status: "Reviewed", response, responseAt } : f));
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

  const ratingsMap = { "Poor": 1, "Fair": 2, "Good": 3, "Very Good": 4, "Excellent": 5 };
  const totalFeedback = filtered.length;
  const reviewedCount = filtered.filter(f => (f.response || "").trim().length > 0 || (f.status || "").toLowerCase().trim() === "reviewed").length;
  const pendingCount = totalFeedback - reviewedCount;
  const avgRating = totalFeedback > 0
    ? (filtered.reduce((acc, curr) => acc + (ratingsMap[curr.rating] || 0), 0) / totalFeedback).toFixed(1)
    : "0.0";

  const openProfileEdit = () => {
    setEditName(facultyName || "");
    setEditDepartment(department || "");
    setIsEditingProfile(true);
  };

  const handleProfileSave = () => {
    setFacultyName(editName.trim());
    setDepartment(editDepartment.trim());
    localStorage.setItem("fullName", editName.trim());
    localStorage.setItem("department", editDepartment.trim());
    setIsEditingProfile(false);
  };

  return (
    <div className="dashboard-container" onClick={() => setShowProfileDropdown(false)}>
      <div className="sidebar">
        <h3>Main Menu</h3>
        <ul>
          <li className={activeMenu === "dashboard" ? "active-link" : ""} onClick={() => setActiveMenu("dashboard")}><FiHome /> Dashboard</li>
          <li className={activeMenu === "reviewFeedback" ? "active-link" : ""} onClick={() => setActiveMenu("reviewFeedback")}><FiCheckSquare /> Review Feedback</li>
          <li className={activeMenu === "history" ? "active-link" : ""} onClick={() => setActiveMenu("history")}><FiCheckSquare /> Feedback History</li>
          <li className="logout-item" onClick={handleLogout} style={{ cursor: "pointer" }}><FiLogOut /> Logout</li>
        </ul>
      </div>

      <div className="main-content">
        {activeMenu === "dashboard" && (
          <>
            <header className="dashboard-header">
              <div className="header-left">
                <h2>Welcome, {facultyName || "Faculty"} 👋</h2>
              </div>
              <div className="profile-container" onClick={(e) => e.stopPropagation()}>
                <div className="profile-avatar-clickable" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                  {(facultyName || "F").charAt(0).toUpperCase()}
                </div>
                {showProfileDropdown && (
                  <div className="profile-dropdown-card">
                    <div className="dropdown-header"><FiUser className="dropdown-icon" /><h4>Faculty Info</h4></div>
                    <div className="dropdown-info-item"><strong>Name:</strong> {facultyName || "Faculty"}</div>
                    <div className="dropdown-info-item"><strong>Dept:</strong> {department || "Department"}</div>
                    <button className="btn-view-details" style={{ width: "100%", marginTop: "10px" }} onClick={openProfileEdit}>
                      <FiEdit style={{ marginRight: "6px" }} /> Edit
                    </button>
                  </div>
                )}
              </div>
            </header>
            <div className="admin-stats-grid">
              <div className="stat-card-admin"><div className="stat-icon-box bg-blue"><FiMessageSquare /></div><div><p className="stat-label">Total Feedback</p><h4 className="stat-value">{totalFeedback}</h4></div></div>
              <div className="stat-card-admin"><div className="stat-icon-box bg-purple"><FiClock /></div><div><p className="stat-label">Pending Feedback</p><h4 className="stat-value">{pendingCount}</h4></div></div>
              <div className="stat-card-admin"><div className="stat-icon-box bg-orange"><FiCheckSquare /></div><div><p className="stat-label">Reviewed Feedback</p><h4 className="stat-value">{reviewedCount}</h4></div></div>
              <div className="stat-card-admin"><div className="stat-icon-box bg-green"><FiStar /></div><div><p className="stat-label">Average Rating</p><h4 className="stat-value">{avgRating}</h4></div></div>
            </div>
            <div className="view-feedback-section" />
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
                            <button
                              className="filter-btn-white"
                              onClick={() => { setSelectedFeedback(item); setResponse(item.response || ""); }}
                              disabled={isReviewed}
                            >
                              {isReviewed ? "Response Submitted" : "Response"}
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

        {activeMenu === "history" && (
          <div className="view-feedback-section">
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Student ID</th><th>Student Name</th><th>Feedback Type</th><th>Details</th></tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item._id}>
                      <td className="td-student">{studentIdByEmail[item.email] || "N/A"}</td>
                      <td className="td-student">{item.studentName || "Anonymous"}</td>
                      <td className="td-type">{item.feedbackType || item.type || "N/A"}</td>
                      <td>
                        <button className="filter-btn-white" onClick={() => setHistorySelected(item)}>
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
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
                  <label>Your Response</label>
                  <textarea placeholder="Type your response here..." value={response} onChange={(e) => setResponse(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setSelectedFeedback(null)}>Cancel</button>
                <button className="btn-primary" onClick={handleReviewSubmit}>Submit</button>
              </div>
            </div>
          </div>
        )}

        {historySelected && (
          <div className="modal-overlay">
            <div className="modal-container history-modal">
              <div className="modal-header">
                <h2>Feedback Details</h2>
                <button className="close-btn" onClick={() => setHistorySelected(null)}><FiX /></button>
              </div>
              <div className="modal-body">
                <div className="feedback-meta">
                  <div><label>Student Name</label><p>{historySelected.studentName || "Anonymous"}</p></div>
                  <div><label>Student ID</label><p>{studentIdByEmail[historySelected.email] || "N/A"}</p></div>
                </div>
                <div className="history-row">
                  <div className="history-item"><label>Feedback Type</label><p>{historySelected.feedbackType || historySelected.type || "N/A"}</p></div>
                  <div className="history-item"><label>Course</label><p>{historySelected.title || "N/A"}</p></div>
                  <div className="history-item"><label>Rating</label><p>{historySelected.rating || "N/A"}</p></div>
                </div>
                <div className="field-group">
                  <label>Suggestion</label>
                  <div className="suggestion-display">{historySelected.suggestions || "No suggestion provided."}</div>
                </div>
                <div className="field-group">
                  <label>Submitted At</label>
                  <div className="suggestion-display">{historySelected.createdAt ? new Date(historySelected.createdAt).toLocaleString() : "N/A"}</div>
                </div>
                <div className="field-group">
                  <label>Response</label>
                  <div className="suggestion-display">{historySelected.response || "No response yet"}</div>
                </div>
                <div className="field-group">
                  <label>Responded At</label>
                  <div className="suggestion-display">{historySelected.responseAt ? new Date(historySelected.responseAt).toLocaleString() : "Not responded yet"}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setHistorySelected(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {isEditingProfile && (
          <div className="modal-overlay" onClick={() => setIsEditingProfile(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3>Edit Profile</h3>
              <p className="modal-subtitle">Update your basic details</p>
              <input className="modal-input" type="text" placeholder="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <input className="modal-input" type="text" placeholder="Department" value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)} />
              <div className="modal-actions">
                <button className="btn-save" onClick={handleProfileSave}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FacultyDashboard;
