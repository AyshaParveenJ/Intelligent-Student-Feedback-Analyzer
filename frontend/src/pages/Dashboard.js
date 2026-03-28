import { useState, useEffect } from "react";
import { 
  FiHome, FiEdit, FiCheckCircle, FiClock, FiBell, 
  FiLogOut, FiCpu, FiUser ,FiLayers, FiRefreshCw, FiSend,
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
  const [showGiveFeedbackModal, setShowGiveFeedbackModal] = useState(false);
  const [view, setView] = useState("dashboard");
  const [filterTab, setFilterTab] = useState("All");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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
  const [selectedReviewed, setSelectedReviewed] = useState(null);
  const [showReviewedModal, setShowReviewedModal] = useState(false);
  
  const fetchUserStatus = async (name) => {
    try {
      const res = await axios.get("https://student-feedback-backend-bia4.onrender.com/api/feedback/all");
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
        const res = await axios.get(`https://student-feedback-backend-bia4.onrender.com/api/student/profile/${encodeURIComponent(email)}`);
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
      await axios.post("https://student-feedback-backend-bia4.onrender.com/api/student/profile", {
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

  const handleProfileEdit = () => {
    setStudentId(savedId || "");
    setDepartment(savedDept || "");
    setYear(savedYear || "");
    setSemester(savedSem || "");
    setIsEditingProfile(true);
  };

  const handleProfileCancel = () => {
    setStudentId(savedId || "");
    setDepartment(savedDept || "");
    setYear(savedYear || "");
    setSemester(savedSem || "");
    setIsEditingProfile(false);
  };

  const handleProfileSave = async () => {
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
      await axios.post("https://student-feedback-backend-bia4.onrender.com/api/student/profile", {
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
      setIsEditingProfile(false);
      fetchUserStatus(studentName);
    } catch (error) {
      console.error("Error saving profile", error);
      alert("Failed to save profile");
    }
  };

  const calculateProgress = () => {
    const requiredTypes = ["Academic", "Training", "Skills", "Events", "Sports", "Hostel", "Personal"];
    const uniqueSubmissions = [...new Set(feedbackData.map(item => item.type))];
    const count = requiredTypes.filter(type => uniqueSubmissions.includes(type)).length;
    const percentage = Math.round((count / requiredTypes.length) * 100);
    return percentage;
  };

  const filteredData = feedbackData.filter(item => 
    filterTab === "All" ? true : item.type === filterTab
  );

  const handleViewDetails = (item) => {
    setSelectedFeedback(item);
    setShowDetailModal(true);
  };

  const handleReviewedClick = (item) => {
    setSelectedReviewed(item);
    setShowReviewedModal(true);
  };

  const getCategoryPath = (type) => {
    const t = (type || "").toLowerCase();
    if (t === "academic") return "/academic";
    if (t === "training") return "/training";
    if (t === "skills") return "/skills";
    if (t === "events") return "/events";
    if (t === "sports") return "/sports";
    if (t === "hostel") return "/hostel";
    if (t === "personal") return "/personal";
    return "/academic";
  };

  const handleEditFeedback = (item) => {
    navigate(getCategoryPath(item.type), { state: { editFeedback: item } });
  };

  const handleDeleteFeedback = async (item) => {
    const ok = window.confirm("Are you sure you want to delete this feedback?");
    if (!ok) return;
    try {
      const feedbackId = item._id || item.id;
      if (!feedbackId) {
        alert("Unable to delete feedback: missing ID");
        return;
      }
      await axios.delete(`https://student-feedback-backend-bia4.onrender.com/api/feedback/${feedbackId}`);
      setFeedbackData(prev => prev.filter(f => (f._id || f.id) !== feedbackId));
      fetchUserStatus(studentName);
    } catch (error) {
      console.error("Error deleting feedback", error);
      alert("Failed to delete feedback");
    }
  };

  return (
    <div className="dashboard-container" onClick={() => setShowProfileDropdown(false)}>
      <div className="sidebar">
        <div className="sidebar-brand"><h3>Main Menu</h3></div>
        <ul>
          <li className={view === "dashboard" ? "active-link" : ""} onClick={() => setView("dashboard")}>
            <FiHome className="icon" /> Dashboard
          </li>
          <li onClick={() => setShowGiveFeedbackModal(true)}>
            <FiEdit className="icon" /> Give Feedback
          </li>
          <li className={view === "status" ? "active-link" : ""} onClick={() => setView("status")}>
            <FiCheckCircle className="icon" /> My Feedback Status
          </li>
          <li className={view === "history" ? "active-link" : ""} onClick={() => setView("history")}>
            <FiClock className="icon" /> Feedback History
          </li>
          <li className="logout-item" onClick={() => { localStorage.clear(); navigate("/"); }}>
            <FiLogOut className="icon" /> Logout
          </li>
        </ul>
      </div>
      <div className="main-viewport">
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
                        {!isEditingProfile && (
                          <>
                            <div className="dropdown-info-item"><strong>ID:</strong> {savedId}</div>
                            <div className="dropdown-info-item"><strong>Dept:</strong> {savedDept}</div>
                            <div className="dropdown-info-item"><strong>Year:</strong> {savedYear}</div>
                            <div className="dropdown-info-item"><strong>Sem:</strong> {savedSem}</div>
                          </>
                        )}
                        {isEditingProfile && (
                          <>
                            <input className="modal-input" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                            <input className="modal-input" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
                            <input className="modal-input" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} />
                            <input className="modal-input" placeholder="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
                          </>
                        )}
                        {!isEditingProfile && (
                          <button className="btn-view-details" style={{ width: "100%", marginTop: "10px" }} onClick={handleProfileEdit}>
                            Edit Profile
                          </button>
                        )}
                        {isEditingProfile && (
                          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                            <button className="btn-view-details" style={{ flex: 1 }} onClick={handleProfileSave}>
                              Save
                            </button>
                            <button className="btn-view-details" style={{ flex: 1 }} onClick={handleProfileCancel}>
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </header>
              <div className="dashboard-grid">
                <div className="left-column">
                  <h3 className="section-title">Feedback Status</h3>
                  <div className="status-cards" style={{ display: 'flex', flexDirection: 'row', gap: '15px', marginBottom: '15px', width: '100%' }}>
                    {[
                      { name: 'Academic', icon: FiBook },
                      { name: 'Training', icon: FiBriefcase },
                      { name: 'Skills', icon: FiAward },
                      { name: 'Events', icon: FiCalendar },
                      { name: 'Sports', icon: FiAward },
                      { name: 'Hostel', icon: FiLayers }
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
                      <th style={{ padding: '16px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                  {[...feedbackData]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((item, index) => (
                      <tr key={index}>
                        <td>{item.type}</td>
                        <td>{item.courseName || item.skillName || item.eventName || item.title || "N/A"}</td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`status-pill ${item.status?.toLowerCase() === 'reviewed' ? 'reviewed' : 'pending'}`}
                            onClick={() => item.status?.toLowerCase() === 'reviewed' && handleReviewedClick(item)}
                            style={item.status?.toLowerCase() === 'reviewed' ? { cursor: 'pointer' } : {}}
                          >
                            {item.status?.toLowerCase() === 'reviewed' ? "Reviewed" : "Pending"}
                          </span>
                        </td>
                        <td className="action-cell">
                          <button className="btn-view-details edit-btn" onClick={() => handleEditFeedback(item)} aria-label="Edit feedback">
                            <FiEdit />
                          </button>
                          <button className="btn-view-details delete-btn" style={{ marginLeft: "8px" }} onClick={() => handleDeleteFeedback(item)}>Delete</button>
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
      {showGiveFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowGiveFeedbackModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Choose Category</h3>
            <p className="modal-subtitle">Select a feedback category to continue</p>
            <select
              className="modal-input"
              defaultValue=""
              onChange={(e) => {
                const value = e.target.value;
                if (!value) return;
                setShowGiveFeedbackModal(false);
                navigate(value);
              }}
            >
              <option value="">Select Category</option>
              <option value="/academic">Academic</option>
              <option value="/training">Training</option>
              <option value="/skills">Skills</option>
              <option value="/events">Events</option>
              <option value="/sports">Sports</option>
              <option value="/hostel">Hostel</option>
              <option value="/personal">Personal</option>
            </select>
          </div>
        </div>
      )}
      {showDetailModal && selectedFeedback && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-box detail-modal" style={{ maxWidth: '520px', padding: '20px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '18px', border: '1px solid #1e293b', boxShadow: '0 10px 20px rgba(0,0,0,0.35)' }}>
              <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '16px', color: '#e2e8f0' }}>Feedback Details</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>Course:</span>{" "}
                  <span style={{ fontSize: '14px', fontWeight: 400, color: '#f1f5f9' }}>{selectedFeedback.courseName || selectedFeedback.skillName || selectedFeedback.eventName || selectedFeedback.title || "N/A"}</span>
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>Rating:</span>{" "}
                  <span style={{ fontSize: '14px', fontWeight: 400, color: '#f1f5f9' }}>{selectedFeedback.rating?.replace(/\/5.*/, "") || "N/A"}</span>
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '16px', color: '#38bdf8' }}>Suggestion</div>
                <div style={{ background: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #222', overflowWrap: 'break-word', wordWrap: 'break-word', fontSize: '14px', lineHeight: '1.5', color: '#e2e8f0' }}>
                  {selectedFeedback.suggestions || "No suggestions provided."}
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>Submitted On:</span>{" "}
                <span style={{ fontSize: '14px', fontWeight: 400, color: '#f1f5f9' }}>
                  {selectedFeedback.createdAt ? new Date(selectedFeedback.createdAt).toLocaleString() : "N/A"}
                </span>
              </div>

              <div style={{ borderTop: '1px solid #1e293b', margin: '15px 0' }}></div>

              <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '16px', color: '#38bdf8' }}>Faculty Response</div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px', border: '1px solid #222', overflowWrap: 'break-word', wordWrap: 'break-word', marginBottom: '12px', fontSize: '14px', lineHeight: '1.5', color: '#e2e8f0' }}>
                {selectedFeedback.response || "No response yet"}
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>Responded At:</span>{" "}
                <span style={{ fontSize: '14px', fontWeight: 400, color: '#f1f5f9' }}>
                  {selectedFeedback.responseAt ? new Date(selectedFeedback.responseAt).toLocaleString() : "-"}
                </span>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button className="btn-save" style={{ width: '100%' }} onClick={() => setShowDetailModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {showReviewedModal && selectedReviewed && (
        <div className="modal-overlay" onClick={() => setShowReviewedModal(false)}>
          <div className="modal-box detail-modal" style={{ maxWidth: '500px', padding: '20px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '18px', border: '1px solid #1e293b', boxShadow: '0 10px 20px rgba(0,0,0,0.35)' }}>
              <div style={{ fontWeight: 600, fontSize: '16px', color: '#e2e8f0', marginBottom: '10px' }}>Student Feedback</div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '16px', color: '#38bdf8' }}>Suggestion</div>
                <div style={{ background: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #222', overflowWrap: 'break-word', wordWrap: 'break-word', fontSize: '14px', lineHeight: '1.5', color: '#e2e8f0' }}>
                  {selectedReviewed.suggestions || "No suggestions provided."}
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>Submitted At:</span>{" "}
                <span style={{ fontSize: '14px', fontWeight: 400, color: '#f1f5f9' }}>
                  {selectedReviewed.createdAt ? new Date(selectedReviewed.createdAt).toLocaleString() : "N/A"}
                </span>
              </div>

              <div style={{ borderTop: '1px solid #1e293b', margin: '15px 0' }}></div>

              <div style={{ fontWeight: 600, fontSize: '16px', color: '#38bdf8', marginBottom: '10px' }}>Faculty Response</div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px', border: '1px solid #222', overflowWrap: 'break-word', wordWrap: 'break-word', marginBottom: '12px', fontSize: '14px', lineHeight: '1.5', color: '#ffffff' }}>
                {selectedReviewed.response || "No response yet"}
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>Responded At:</span>{" "}
                <span style={{ fontSize: '14px', fontWeight: 400, color: '#f1f5f9' }}>
                  {selectedReviewed.responseAt ? new Date(selectedReviewed.responseAt).toLocaleString() : "-"}
                </span>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button className="btn-save" style={{ width: '100%' }} onClick={() => setShowReviewedModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
