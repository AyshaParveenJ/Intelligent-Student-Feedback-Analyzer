import { useState, useEffect } from "react";
import { 
  FiHome, FiEdit, FiCheckCircle, FiClock, FiBell, 
  FiHelpCircle, FiLogOut, FiCpu, FiUser ,FiLayers, FiRefreshCw, FiSend,
  FiBook, FiBriefcase, FiAward, FiCalendar 
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [view, setView] = useState("dashboard");
  const [filterTab, setFilterTab] = useState("All");

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

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const fetchUserStatus = async (name) => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback/all");
      const myFeedback = res.data.filter(f => f.studentName === name);
      
      const sortedFeedback = [...myFeedback].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setFeedbackData(sortedFeedback); 
      
      const types = [...new Set(sortedFeedback.map(f => f.type))];
      setSubmittedTypes(types);
      
      if (sortedFeedback.length > 0) {
        setRecentActivity(sortedFeedback[sortedFeedback.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching status", error);
    }
  };

  useEffect(() => {
    const name = localStorage.getItem("fullName");
    const email = localStorage.getItem("loginEmail");
    let intervalId;

    if (name) setStudentName(name);

    const loadProfile = async () => {
      if (!email) {
        setShowModal(true);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/student/profile/${encodeURIComponent(email)}`);
        const profile = res.data;

        localStorage.setItem("studentId", profile.studentId || "");
        localStorage.setItem("department", profile.department || "");
        localStorage.setItem("year", profile.year || "");
        localStorage.setItem("semester", profile.semester || "");

        setSavedId(profile.studentId || "");
        setSavedDept(profile.department || "");
        setSavedYear(profile.year || "");
        setSavedSem(profile.semester || "");

        fetchUserStatus(name);

        intervalId = setInterval(() => {
          fetchUserStatus(name);
        }, 5000);
      } catch (error) {
        if (error.response?.status === 404) {
          setShowModal(true);
        } else {
          console.error("Error fetching profile", error);
          setShowModal(true);
        }
      }
    };

    loadProfile();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const handleSave = async () => {
    if (!studentId || !department || !year || !semester) {
      alert("Please fill in all details");
      return;
    }
    const email = localStorage.getItem("loginEmail");
    if (!email) {
      alert("Please log in again to save your profile");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/student/profile", {
        email,
        studentId,
        department,
        year,
        semester
      });
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
    } catch (error) {
      console.error("Error saving profile", error);
      alert("Failed to save profile");
    }
  };

  const calculateProgress = () => {
    const requiredTypes = ["Academic", "Training", "Skills", "Events"];
    const uniqueSubmissions = [...new Set(feedbackData.map(item => item.type))];
    const count = requiredTypes.filter(type => uniqueSubmissions.includes(type)).length;
    const percentage = count * 25;
    return percentage;
  };

  const filteredData = feedbackData.filter(item => 
    filterTab === "All" ? true : item.type === filterTab
  );

  const handleViewDetails = (item) => {
    setSelectedFeedback(item);
    setShowDetailModal(true);
  };

  return (
    <div className="dashboard-container" onClick={() => setShowProfileDropdown(false)}>
      <div className="sidebar">
        <div className="sidebar-brand"><h3>Main Menu</h3></div>
        <ul>
          <li className={view === "dashboard" ? "active-link" : ""} onClick={() => setView("dashboard")}>
            <FiHome className="icon" /> Dashboard
          </li>
          <li onClick={() => navigate("/academic")}>
            <FiEdit className="icon" /> Give Feedback
          </li>
          <li className={view === "status" ? "active-link" : ""} onClick={() => setView("status")}>
            <FiCheckCircle className="icon" /> My Feedback Status
          </li>
          <li className={view === "history" ? "active-link" : ""} onClick={() => setView("history")}>
            <FiClock className="icon" /> Feedback History
          </li>
          <li><FiBell className="icon" /> Notifications</li>
          <li><FiHelpCircle className="icon" /> Help / Support</li>
          <li className="logout-item" onClick={() => { localStorage.clear(); navigate("/"); }}>
            <FiLogOut className="icon" /> Logout
          </li>
        </ul>
      </div>
      <div className="main-viewport" style={{ overflow: 'hidden' }}>
        <div className="main-content-inner">
          {view === "dashboard" && (
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
                <button className="btn btn-blue" onClick={() => navigate("/academic")}>+ Give Feedback</button>
                <button className="btn btn-purple" onClick={() => setView("history")}>View History</button>
                <button className="btn btn-teal">View Suggestions</button>
              </div>
              <div className="dashboard-grid">
                <div className="left-column">
                  <h3 className="section-title">Feedback Status</h3>
                  <div className="status-cards" style={{ display: 'flex', flexDirection: 'row', gap: '15px', marginBottom: '15px', width: '100%' }}>
                    {[
                      { name: 'Academic', icon: FiBook },
                      { name: 'Training', icon: FiBriefcase },
                      { name: 'Skills', icon: FiAward },
                      { name: 'Events', icon: FiCalendar }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSubmitted = submittedTypes.includes(item.name);
                      return (
                        <div key={item.name} className={`status-card ${item.name.toLowerCase()}`} style={{ flex: 1, padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Icon style={{ fontSize: '15px' }} />
                            <h4 style={{ margin: 0 }}>{item.name}</h4>
                          </div>
                          <p style={{ margin: '10px 0 0 0', fontWeight: 'bold' }} className={isSubmitted ? "text-success" : "text-pending"}>
                            {isSubmitted ? "Submitted ✓" : "Pending..."}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="progress-section" style={{ marginTop: '20px' }}>
                    <div className="progress-container-inner">
                      <div className="progress-info">
                        <span>Feedback Completion</span>
                        <span>{calculateProgress()}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${calculateProgress()}%` }}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* MODIFIED AI SUMMARY SECTION */}
                  <div className="ai-summary-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <FiCpu className="ai-icon" />
                      <h4 style={{ margin: 0 }}>AI Summary</h4>
                    </div>
                    <div className="ai-content">
                      <div>
                        <strong>Thank you for your feedback!</strong>
                        <p className="sub-text">Your inputs help us improve the academic quality at AYS.</p>
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
                    ) : <p className="no-activity">No recent activity</p>}
                  </div>
                  <div className="privacy-card">
                    <h4>Privacy</h4>
                    <p className="sub-text">Your feedback is confidential and used only for improvement.</p>
                  </div>
                </div>
              </div>
            </>
          )}
          {view === "status" && (
            <div className="feedback-status-container">
              <h2 className="view-title">My Feedback Status</h2>
              <p className="sub-text">Overview of your submission progress.</p>
              <div className="feedback-table-container" style={{ marginTop: "30px" }}>
                <table className="feedback-table">
                  <thead>
                    <tr>
                      <th style={{ padding: '16px' }}>Feedback Type</th>
                      <th style={{ padding: '16px' }}>Event Name</th>
                      <th style={{ padding: '16px' }}>Submitted On</th>
                      <th style={{ padding: '16px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.type}</td>
                        <td>{item.courseName || item.skillName || item.eventName || item.title || "N/A"}</td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span 
                            style={{
                              padding: '5px 12px',
                              borderRadius: '15px',
                              fontWeight: 'bold',
                              fontSize: '0.85rem',
                              backgroundColor: item.status?.toLowerCase() === 'reviewed' ? '#d4edda' : '#fff3cd',
                              color: item.status?.toLowerCase() === 'reviewed' ? '#155724' : '#856404'
                            }}
                          >
                            {item.status?.toLowerCase() === 'reviewed' ? "Reviewed" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {view === "history" && (
            <div className="feedback-status-container">
              <h2 className="view-title">Feedback History</h2>
              <p className="sub-text">Detailed log of all your submitted responses.</p>
              <div className="filter-tabs" style={{marginTop: "20px"}}>
                {["All", "Academic", "Training", "Skills", "Events"].map((tab) => (
                  <button 
                    key={tab}
                    className={filterTab === tab ? "active" : ""} 
                    onClick={() => setFilterTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="feedback-table-container">
                <h3 className="table-header-text">Feedback List</h3>
                <table className="feedback-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%', padding: '16px' }}>Feedback Type</th>
                      <th style={{ width: '20%', padding: '16px' }}>Submitted On</th>
                      <th style={{ width: '20%', padding: '16px' }}>Detail Status</th>
                      <th style={{ width: '%', padding: '16px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.type} Feedback</td>
                        <td>{new Date(item.createdAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}</td>
                        <td>
                          <span className="status-tag submitted-alt">
                              ✓ Submitted
                          </span>
                        </td>
                        <td>
                          <button className="btn-view-details" onClick={() => handleViewDetails(item)}>View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      {showDetailModal && selectedFeedback && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-box detail-modal" style={{ maxWidth: '450px', padding: '25px' }} onClick={(e) => e.stopPropagation()}>
            <div className="detail-header" style={{ marginBottom: '20px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{selectedFeedback.type} Feedback Details</h3>
            </div>
            <div className="detail-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                <span style={{ color: '#888' }}>
                  {selectedFeedback.type === "Academic" ? "Course Name:" : 
                   selectedFeedback.type === "Skills" ? "Skill Name:" : 
                   selectedFeedback.type === "Events" ? "Event Name:" : "Title:"}
                </span>
                <span style={{ fontWeight: '600' }}>
                   {selectedFeedback.courseName || selectedFeedback.skillName || selectedFeedback.eventName || selectedFeedback.title || "N/A"}
                </span>
              </div>
              {selectedFeedback.facultyName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                  <span style={{ color: '#888' }}>Faculty Name:</span>
                  <span style={{ fontWeight: '600' }}>{selectedFeedback.facultyName}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                <span style={{ color: '#888' }}>Rating:</span>
                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {selectedFeedback.rating?.replace(/\/5.*/, "") || "N/A"}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                <span style={{ color: '#888' }}>Submitted On:</span>
                <span style={{ fontSize: '0.9rem' }}>{new Date(selectedFeedback.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ marginTop: '15px' }}>
                <h4 style={{ color: '#888', marginBottom: '8px', fontSize: '1rem' }}>Suggestions:</h4>
                <div style={{ background: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #222' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>{selectedFeedback.suggestions || "No suggestions provided."}</p>
                </div>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button className="btn-save" style={{ width: '100%' }} onClick={() => setShowDetailModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
