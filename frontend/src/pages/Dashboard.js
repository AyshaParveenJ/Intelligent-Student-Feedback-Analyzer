import { useState, useEffect } from "react";
import { 
  FiHome, FiEdit, FiCheckCircle, FiClock, FiBell, 
  FiHelpCircle, FiLogOut, FiChevronDown, FiCpu 
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [savedDept, setSavedDept] = useState("");
  const [savedYear, setSavedYear] = useState("");
  const [showFeedbackMenu, setShowFeedbackMenu] = useState(false);
  
  const [submittedTypes, setSubmittedTypes] = useState([]);
  const [recentActivity, setRecentActivity] = useState(null);

  useEffect(() => {
    const name = localStorage.getItem("fullName");
    const dept = localStorage.getItem("department");
    const yr = localStorage.getItem("year");

    if (name) setStudentName(name);
    if (dept) setSavedDept(dept);
    if (yr) setSavedYear(yr);

    if (!dept || !yr) {
      setShowModal(true);
    } else {
      fetchUserStatus(name);
    }
  }, []);

  const fetchUserStatus = async (name) => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback/all");
      const myFeedback = res.data.filter(f => f.studentName === name);
      const types = myFeedback.map(f => f.type);
      setSubmittedTypes(types);

      if (myFeedback.length > 0) {
        setRecentActivity(myFeedback[myFeedback.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching status", error);
    }
  };

  const handleSave = () => {
    if (!department || !year) {
      alert("Please select Department and Year");
      return;
    }
    localStorage.setItem("department", department);
    localStorage.setItem("year", year);
    setSavedDept(department);
    setSavedYear(year);
    setShowModal(false);
    fetchUserStatus(studentName);
  };

  const calculateProgress = () => {
    const total = 4; 
    return (submittedTypes.length / total) * 100;
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR WITH UPDATED MENU ITEMS */}
      <div className="sidebar">
        <div className="sidebar-brand">
           <h3>Main Menu</h3>
        </div>
        <ul>
          <li onClick={() => navigate("/dashboard")}><FiHome className="icon" /> Dashboard</li>
          
          <li onClick={() => setShowFeedbackMenu(!showFeedbackMenu)}>
            <FiEdit className="icon" /> Give Feedback <FiChevronDown style={{marginLeft: "auto"}} />
          </li>
          {showFeedbackMenu && (
            <ul className="submenu">
              <li onClick={() => navigate("/academic")}>Academic</li>
              <li onClick={() => navigate("/training")}>Training</li>
              <li onClick={() => navigate("/skills")}>Skills</li>
              <li onClick={() => navigate("/events")}>Events</li>
            </ul>
          )}

          <li><FiCheckCircle className="icon" /> My Feedback Status</li>
          <li><FiClock className="icon" /> Feedback History</li>
          <li><FiBell className="icon" /> Notifications</li>
          <li><FiHelpCircle className="icon" /> Help / Support</li>
          
          <li className="logout-item" onClick={() => { localStorage.clear(); navigate("/"); }}>
            <FiLogOut className="icon" /> Logout
          </li>
        </ul>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-viewport">
        <div className="main-content-inner">
          <header className="dashboard-header">
            <h2>Welcome, {studentName} 👋</h2>
            <p className="sub-text">{savedDept} — {savedYear}</p>
          </header>

          <div className="action-buttons">
            <button className="btn btn-blue" onClick={() => setShowFeedbackMenu(true)}>+ Give Feedback</button>
            <button className="btn btn-purple">View My Status</button>
            <button className="btn btn-teal">View Suggestions</button>
          </div>

          <div className="dashboard-grid">
            <div className="left-column">
              <h3 className="section-title">Feedback Status</h3>
              <div className="status-cards">
                {['Academic', 'Training', 'Skills'].map((type) => (
                  <div key={type} className={`status-card ${type.toLowerCase()}`}>
                    <FiEdit className="card-icon" />
                    <h4>{type} Feedback</h4>
                    <p className={submittedTypes.includes(type) ? "text-success" : "text-pending"}>
                      {submittedTypes.includes(type) ? "Submitted ✓" : "Pending..."}
                    </p>
                  </div>
                ))}
              </div>

              <div className="progress-section">
                <div className="progress-info">
                  <span>Feedback Completion</span>
                  <span>{calculateProgress()}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${calculateProgress()}%` }}></div>
                </div>
              </div>

              <div className="ai-summary-card">
                <h4>AI Summary</h4>
                <div className="ai-content">
                  <FiCpu className="ai-icon" />
                  <div>
                    <strong>Thank you for your feedback!</strong>
                    <p>Your inputs help us improve the academic quality at AYS.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="right-column">
              <h3 className="section-title">Recent Activity</h3>
              <div className="activity-card">
                {recentActivity ? (
                  <div className="activity-item">
                    <FiClock className="act-icon" />
                    <div>
                      <p className="act-time">Just Now</p>
                      <p className="act-desc">{recentActivity.type} Feedback Submitted</p>
                    </div>
                  </div>
                ) : (
                  <p className="no-activity">No recent activity</p>
                )}
              </div>
              
              <div className="privacy-card">
                <h4>Privacy</h4>
                <p>Your feedback is confidential and used only for academic improvement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
             <h3>Set Your Details</h3>
             <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="">Select Department</option>
                <option>Computer Science</option>
                <option>Information Technology</option>
                <option>Artificial Intelligence and Machine Learning</option>
                <option>Artificial Intelligence and Data Science</option>
                <option>ECE</option>
                <option>EEE</option>
                <option>Mechanical</option>
             </select>
             <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Select Year</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
             </select>
             <button onClick={handleSave}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;