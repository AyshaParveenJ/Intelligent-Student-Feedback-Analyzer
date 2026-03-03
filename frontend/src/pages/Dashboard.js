import { useState, useEffect } from "react";
import { 
  FiHome, FiEdit, FiCheckCircle, FiClock, FiBell, 
  FiHelpCircle, FiLogOut, FiChevronDown, FiCpu, FiUser 
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackMenu, setShowFeedbackMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [view, setView] = useState("dashboard");

  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");

  const [savedId, setSavedId] = useState("");
  const [savedDept, setSavedDept] = useState("");
  const [savedYear, setSavedYear] = useState("");
  const [savedSem, setSavedSem] = useState("");

  const [submittedTypes, setSubmittedTypes] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]); 
  const [recentActivity, setRecentActivity] = useState(null);

  useEffect(() => {
    const name = localStorage.getItem("fullName");
    const id = localStorage.getItem("studentId");
    const dept = localStorage.getItem("department");
    const yr = localStorage.getItem("year");
    const sem = localStorage.getItem("semester");

    if (name) setStudentName(name);
    if (id) setSavedId(id);
    if (dept) setSavedDept(dept);
    if (yr) setSavedYear(yr);
    if (sem) setSavedSem(sem);

    if (!id || !dept || !yr || !sem) {
      setShowModal(true);
    } else {
      fetchUserStatus(name);
    }
  }, []);

  const fetchUserStatus = async (name) => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback/all");
      const myFeedback = res.data.filter(f => f.studentName === name);
      setFeedbackData(myFeedback); 
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
    if (!studentId || !department || !year || !semester) {
      alert("Please fill in all details");
      return;
    }
    localStorage.setItem("studentId", studentId);
    localStorage.setItem("department", department);
    localStorage.setItem("year", year);
    localStorage.setItem("semester", semester);
    setSavedId(studentId);
    setSavedDept(department);
    setSavedYear(year);
    setSavedSem(semester);
    setShowModal(false);
    fetchUserStatus(studentName);
  };

  const calculateProgress = () => {
    const total = 4; 
    return (submittedTypes.length / total) * 100;
  };

  return (
    <div className="dashboard-container" onClick={() => setShowProfileDropdown(false)}>
      <div className="sidebar">
        <div className="sidebar-brand"><h3>Main Menu</h3></div>
        <ul>
          <li onClick={() => setView("dashboard")}><FiHome className="icon" /> Dashboard</li>
          <li onClick={(e) => { e.stopPropagation(); setShowFeedbackMenu(!showFeedbackMenu); }}>
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
          <li onClick={() => setView("status")}><FiCheckCircle className="icon" /> My Feedback Status</li>
          <li onClick={() => setView("status")}><FiClock className="icon" /> Feedback History</li>
          <li><FiBell className="icon" /> Notifications</li>
          <li><FiHelpCircle className="icon" /> Help / Support</li>
          <li className="logout-item" onClick={() => { localStorage.clear(); navigate("/"); }}>
            <FiLogOut className="icon" /> Logout
          </li>
        </ul>
      </div>

      <div className="main-viewport">
        <div className="main-content-inner">
          {view === "dashboard" ? (
            <>
              <header className="dashboard-header">
                <div className="header-left">
                    <h2>Welcome, {studentName} 👋</h2>
                    <p className="sub-text">Academic Overview</p>
                </div>

                <div className="profile-container" onClick={(e) => e.stopPropagation()}>
                    <div className="profile-avatar-clickable" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                        {studentName.charAt(0).toUpperCase()}
                    </div>
                    {showProfileDropdown && (
                      <div className="profile-dropdown-card">
                        <div className="dropdown-header"><FiUser className="dropdown-icon" /><h4>Student Info</h4></div>
                        <div className="dropdown-info-item"><strong>Name:</strong> {studentName}</div>
                        <div className="dropdown-info-item"><strong>ID:</strong> {savedId}</div>
                        <div className="dropdown-info-item"><strong>Dept:</strong> {savedDept}</div>
                        <div className="dropdown-info-item"><strong>Year:</strong> {savedYear}</div>
                        <div className="dropdown-info-item"><strong>Sem:</strong> {savedSem}</div>
                      </div>
                    )}
                </div>
              </header>

              <div className="action-buttons">
                <button className="btn btn-blue" onClick={() => setShowFeedbackMenu(true)}>+ Give Feedback</button>
                <button className="btn btn-purple" onClick={() => setView("status")}>View My Status</button>
                <button className="btn btn-teal">View Suggestions</button>
              </div>

              <div className="dashboard-grid">
                <div className="left-column">
                  <h3 className="section-title">Feedback Status</h3>
                  <div className="status-cards">
                    <div className="status-card academic">
                        <FiEdit className="card-icon" />
                        <h4>Academic Feedback</h4>
                        <p className={submittedTypes.includes('Academic') ? "text-success" : "text-pending"}>
                          {submittedTypes.includes('Academic') ? "Submitted ✓" : "Pending..."}
                        </p>
                    </div>
                    <div className="status-card training">
                        <FiEdit className="card-icon" />
                        <h4>Training Feedback</h4>
                        <p className={submittedTypes.includes('Training') ? "text-success" : "text-pending"}>
                          {submittedTypes.includes('Training') ? "Submitted ✓" : "Pending..."}
                        </p>
                    </div>
                    <div className="status-card skills">
                        <FiEdit className="card-icon" />
                        <h4>Skills Feedback</h4>
                        <p className={submittedTypes.includes('Skills') ? "text-success" : "text-pending"}>
                          {submittedTypes.includes('Skills') ? "Submitted ✓" : "Pending..."}
                        </p>
                    </div>
                  </div>
                  
                  <div className="progress-section">
                    <div className="progress-info" style={{display: "flex", justifyContent: "space-between", marginBottom: "10px"}}>
                        <span>Feedback Completion</span>
                        <span>{calculateProgress()}%</span>
                    </div>
                    <div className="progress-bar" style={{width: "100%", background: "#1e293b", height: "8px", borderRadius: "4px"}}>
                        <div className="progress-fill" style={{ width: `${calculateProgress()}%`, background: "#3b82f6", height: "100%", borderRadius: "4px" }}></div>
                    </div>
                  </div>

                  <div className="ai-summary-card" style={{background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b"}}>
                    <h4>AI Summary</h4>
                    <div className="ai-content" style={{display: "flex", gap: "15px", marginTop: "15px", alignItems: "center"}}>
                      <FiCpu className="ai-icon" style={{fontSize: "2rem", color: "#22d3ee"}} />
                      <div>
                        <strong>Thank you for your feedback!</strong>
                        <p className="sub-text">Your inputs help us improve the academic quality at AYS.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="right-column">
                  <h3 className="section-title">Recent Activity</h3>
                  <div className="activity-card" style={{background: "#1e293b", padding: "20px", borderRadius: "12px", marginBottom: "20px"}}>
                    {recentActivity ? (
                        <div className="activity-item" style={{display: "flex", gap: "12px"}}>
                            <FiClock className="act-icon" />
                            <div>
                                <p className="act-time" style={{fontSize: "0.75rem", color: "#94a3b8"}}>Just Now</p>
                                <p className="act-desc">{recentActivity.type} Feedback Submitted</p>
                            </div>
                        </div>
                    ) : <p className="no-activity">No recent activity</p>}
                  </div>
                  <div className="privacy-card" style={{background: "#1e293b", padding: "20px", borderRadius: "12px"}}>
                    <h4>Privacy</h4>
                    <p className="sub-text">Your feedback is confidential and used only for improvement.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="feedback-status-container">
              <h2 className="view-title">My Feedback Status</h2>
              <p className="sub-text">View the status of your submitted feedback.</p>

              <div className="status-summary-row">
                <div className="summary-card blue-glow">
                  <FiCheckCircle className="sum-icon"/> <div><h3>1 Submitted</h3><p>Academic Feedback</p></div>
                </div>
                <div className="summary-card orange-glow">
                  <FiEdit className="sum-icon"/> <div><h3>1 Submitted</h3><p>Training Feedback</p></div>
                </div>
                <div className="summary-card dark-glow">
                  <FiClock className="sum-icon"/> <div><h3>1 Pending</h3><p>Feedback</p></div>
                </div>
              </div>

              <div className="filter-tabs">
                <button className="active">All</button>
                <button>Academic</button><button>Training</button><button>Skills</button><button>Events</button>
              </div>

              <div className="feedback-table-container">
                <h3 className="table-header-text">Feedback List</h3>
                <table className="feedback-table">
                  <thead>
                    <tr>
                      <th>Feedback Type</th>
                      <th>Submitted On</th>
                      <th>Status</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.type} Feedback</td>
                        <td>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                        <td><span className="status-tag submitted">✓ Submitted</span></td>
                        <td><span className="status-tag submitted-alt">✓ Submitted</span></td>
                        <td><button className="btn-view-details">View Details</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="table-footer">
                  <span>Showing {feedbackData.length} entries</span>
                  <div className="pagination">
                    <button className="pag-btn">‹</button><button className="pag-btn active">1</button><span>1/1</span><button className="pag-btn">›</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
             <h3>Set Your Details</h3>
             <p className="modal-subtitle">Enter your academic information to continue</p>
             <input type="text" className="modal-input" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
             <select className="modal-input" value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="">Select Department</option>
                <option>Information Technology</option><option>Computer Science</option><option>ECE</option>
             </select>
             <select className="modal-input" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Select Year</option>
                <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
             </select>
             <select className="modal-input" value={semester} onChange={(e) => setSemester(e.target.value)}>
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={`Sem ${s}`}>Semester {s}</option>)}
             </select>
             <div className="modal-actions"><button className="btn-save" onClick={handleSave}>Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;