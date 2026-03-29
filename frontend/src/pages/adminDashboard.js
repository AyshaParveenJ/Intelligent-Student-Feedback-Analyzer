import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FiHome, FiClipboard, FiBarChart2, FiLogOut, FiSearch,
  FiMessageSquare, FiStar, FiCalendar, FiThumbsUp, FiClock, FiCheckSquare, FiX, FiAward, FiAlertTriangle, FiUserPlus
} from "react-icons/fi";
import "./adminDashboard.css";

function AdminDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  
  const [analyticsType, setAnalyticsType] = useState("Overall Performance");
  const [analyticsYear, setAnalyticsYear] = useState("All Years");

  const [typeFilter, setTypeFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [search, setSearch] = useState("");
  const [recentDate, setRecentDate] = useState("");
  const [recentYear, setRecentYear] = useState("");
  const [recentType, setRecentType] = useState(""); 
  const [recentSearch, setRecentSearch] = useState("");
  const [recentFiltered, setRecentFiltered] = useState([]);
  const [studentIdByEmail, setStudentIdByEmail] = useState({});
  const [reviewSearch, setReviewSearch] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [dashboardStats, setDashboardStats] = useState({ total: 0, pending: 0, reviewed: 0 });
  const [userRole, setUserRole] = useState("Student");
  const [userName, setUserName] = useState("");
  const [userStudentId, setUserStudentId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userDepartment, setUserDepartment] = useState("");
  const [userYear, setUserYear] = useState("");
  const [userSemester, setUserSemester] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("authToken"); 
    window.location.href = "/login";
  };

  const fetchFeedback = async () => {
    try {
      const res = await axios.get("https://student-feedback-backend-bia4.onrender.com/api/feedback/all");
      setFeedbacks(res.data);
      
      const reviewed = new Set(
        res.data
          .filter(f => (f.status || "").toLowerCase().trim() === "reviewed")
          .map(f => f._id)
      );
      setReviewedIds(reviewed);

      const emails = Array.from(new Set(res.data.map(f => f.email).filter(Boolean)));
      if (emails.length) {
        const profileResults = await Promise.all(
          emails.map(email =>
            axios
              .get(`https://student-feedback-backend-bia4.onrender.com/api/student/profile/${encodeURIComponent(email)}`)
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
    } catch (error) { console.log(error); }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("https://student-feedback-backend-bia4.onrender.com/api/feedback/stats");
      setDashboardStats(res.data);
    } catch (error) { console.log(error); }
  };

  const applyFilters = useCallback(() => {
    let data = [...feedbacks];
    if (typeFilter) data = data.filter(f => (f.feedbackType === typeFilter || f.type === typeFilter));
    if (deptFilter) data = data.filter(f => f.department === deptFilter);
    if (yearFilter) data = data.filter(f => f.year === yearFilter);
    if (search) data = data.filter(f => (f.title || "").toLowerCase().includes(search.toLowerCase()));
    setFiltered(data);
  }, [typeFilter, deptFilter, yearFilter, search, feedbacks]);

  const applyRecentFilters = useCallback(() => {
    const now = new Date();
    const isCurrentMonth = (dateValue) => {
      if (!dateValue) return false;
      const d = new Date(dateValue);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };
    let data = [...feedbacks];
    data = data.filter(f => isCurrentMonth(f.createdAt));
    if (recentSearch) data = data.filter(f => (f.studentName || "").toLowerCase().includes(recentSearch.toLowerCase()));
    if (recentDate) data = data.filter(f => new Date(f.createdAt).toISOString().split('T')[0] === recentDate);
    if (recentYear) data = data.filter(f => f.year === recentYear);
    if (recentType) data = data.filter(f => (f.feedbackType === recentType || f.type === recentType));
    setRecentFiltered(data);
  }, [recentSearch, recentDate, recentYear, recentType, feedbacks]);

  useEffect(() => { fetchFeedback(); fetchStats(); }, []);
  
  useEffect(() => {
    if (activeMenu === "view") applyFilters();
  }, [activeMenu, applyFilters]);

  useEffect(() => {
    if (activeMenu === "recent") applyRecentFilters();
  }, [activeMenu, applyRecentFilters]);

  useEffect(() => { 
    setFiltered(feedbacks); 
    const now = new Date();
    const currentMonthData = feedbacks.filter(f => {
      if (!f.createdAt) return false;
      const d = new Date(f.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    setRecentFiltered(currentMonthData.slice(0, 5)); 
  }, [feedbacks]);

  const handleAddUser = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!userName || !userEmail || !userPassword) {
      alert("Please fill all required fields");
      return;
    }

    if (userRole === "Student" && (!userStudentId || !userDepartment || !userYear || !userSemester)) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const payload =
        userRole === "Faculty"
          ? { name: userName, email: userEmail, password: userPassword }
          : { name: userName, studentId: userStudentId, department: userDepartment, year: userYear, semester: userSemester, email: userEmail, password: userPassword };
      console.log("Create User Payload:", payload);
      if (userRole === "Faculty") {
        await axios.post("https://student-feedback-backend-bia4.onrender.com/api/faculty", payload, {
          headers: { "Content-Type": "application/json" }
        });
        alert("Faculty added successfully");
      } else {
        await axios.post("https://student-feedback-backend-bia4.onrender.com/api/students", payload, {
          headers: { "Content-Type": "application/json" }
        });
        alert("Student added successfully");
      }

      setUserName("");
      setUserStudentId("");
      setUserEmail("");
      setUserPassword("");
      setUserDepartment("");
      setUserYear("");
      setUserSemester("");
    } catch (error) {
      alert(error.response?.data?.message || "Error adding user");
    }
  };

  const displayData = activeMenu === "analytics" 
    ? feedbacks.filter(f => {
        const isOverall = analyticsType === "Overall Performance";
        const cleanType = analyticsType.replace(" Performance", "");
        const typeMatch = isOverall || (f.feedbackType === cleanType || f.type === cleanType);
        const yearMatch = analyticsYear === "All Years" || f.year === analyticsYear;
        return typeMatch && yearMatch;
      })
    : feedbacks;

  const ratingsMap = { "Poor": 1, "Fair": 2, "Good": 3, "Very Good": 4, "Excellent": 5 };
  const total = displayData.length;
  const avgRating = total > 0 ? (displayData.reduce((acc, curr) => acc + (ratingsMap[curr.rating] || 0), 0) / total).toFixed(1) : "0.0";

  const groupedData = displayData.reduce((acc, curr) => {
    if (!acc[curr.title]) acc[curr.title] = { totalRating: 0, count: 0 };
    acc[curr.title].totalRating += ratingsMap[curr.rating] || 0;
    acc[curr.title].count += 1;
    return acc;
  }, {});

  const rankedItems = Object.keys(groupedData).map(title => ({
    title,
    avg: (groupedData[title].totalRating / groupedData[title].count).toFixed(1)
  })).sort((a, b) => b.avg - a.avg);

  const best = rankedItems[0] || { title: "N/A", avg: 0 };
  const worst = rankedItems[rankedItems.length - 1] || { title: "N/A", avg: 0 };

  const feedbackCategories = [
    { label: "Poor", color: "#ef4444" },
    { label: "Fair", color: "#f97316" },
    { label: "Very Good", color: "#fbbf24" },
    { label: "Good", color: "#4ade80" },
    { label: "Excellent", color: "#22d3ee" }
  ];

  const dist = feedbackCategories.map(cat => {
    const count = displayData.filter(f => f.rating === cat.label).length;
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
    return { ...cat, percentage, height: total > 0 ? (count / total) * 100 : 0 };
  });

  const positive = displayData.filter(f => ["Very Good", "Excellent"].includes(f.rating)).length;
  const neutral = displayData.filter(f => f.rating === "Good").length;
  const negative = displayData.filter(f => ["Poor", "Fair"].includes(f.rating)).length;

  const getPercent = (count) => (total > 0 ? Math.round((count / total) * 100) : 0);
  const posP = getPercent(positive);
  const neuP = getPercent(neutral);
  const negP = getPercent(negative);

  const pendingCount = feedbacks.length - reviewedIds.size;
  const reviewedCount = reviewedIds.size;
  const dashboardTotal = dashboardStats.total ?? total;
  const dashboardPending = dashboardStats.pending ?? pendingCount;
  const dashboardReviewed = dashboardStats.reviewed ?? reviewedCount;

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
          <li className={activeMenu === "view" ? "active-link" : ""} onClick={() => setActiveMenu("view")}><FiClipboard /> View Feedback</li>
          <li className={activeMenu === "recent" ? "active-link" : ""} onClick={() => setActiveMenu("recent")}><FiClock /> Recent Feedback</li>
          <li className={activeMenu === "review" ? "active-link" : ""} onClick={() => setActiveMenu("review")}><FiCheckSquare /> Review Feedback</li>
          <li className={activeMenu === "analytics" ? "active-link" : ""} onClick={() => setActiveMenu("analytics")}><FiBarChart2 /> Analytics</li>
          <li className={activeMenu === "addFaculty" ? "active-link" : ""} onClick={() => setActiveMenu("addFaculty")}><FiUserPlus /> Add User</li>
          <li className="logout-item" onClick={handleLogout} style={{ cursor: "pointer" }}><FiLogOut /> Logout</li>
        </ul>
      </div>

      <div className="main-content">
        {activeMenu === "dashboard" && (
          <div className="admin-header-flex">
              <h2>Welcome, Admin 👋</h2>
          </div>
        )}

        {(activeMenu === "dashboard" || activeMenu === "analytics") && (
          <div className="admin-front-page">
            <div className="admin-stats-grid">
              <div className="stat-card-admin"><div className="stat-icon-box bg-blue"><FiMessageSquare /></div><div><p className="stat-label">Total Feedback</p><h4 className="stat-value">{activeMenu === "dashboard" ? dashboardTotal : total}</h4></div></div>
              <div className="stat-card-admin"><div className="stat-icon-box bg-green"><FiStar /></div><div><p className="stat-label">Average Rating</p><h4 className="stat-value">{avgRating}</h4></div></div>
              
              {activeMenu === "dashboard" ? (
                <>
                  <div className="stat-card-admin"><div className="stat-icon-box bg-purple"><FiAlertTriangle /></div><div><p className="stat-label">Pending</p><h4 className="stat-value">{dashboardPending}</h4></div></div>
                  <div className="stat-card-admin"><div className="stat-icon-box bg-orange"><FiCheckSquare /></div><div><p className="stat-label">Reviewed</p><h4 className="stat-value">{dashboardReviewed}</h4></div></div>
                </>
              ) : (
                <>
                  <div className="stat-card-admin"><div className="stat-icon-box bg-purple"><FiCalendar /></div><div><p className="stat-label">Sentiment Positive</p><h4 className="stat-value">{posP}%</h4></div></div>
                  <div className="stat-card-admin"><div className="stat-icon-box bg-orange"><FiThumbsUp /></div><div><p className="stat-label">Sentiment Negative</p><h4 className="stat-value">{negP}%</h4></div></div>
                </>
              )}
            </div>

            <div className="charts-row">
                <div className="chart-box main-analytics-container">
                    {activeMenu === "analytics" ? (
                      <div className="analytics-header-inline">
                        <h2 className="analytics-main-title">{analyticsType}</h2>
                        <div className="analytics-selectors">
                          <select value={analyticsType} onChange={(e) => setAnalyticsType(e.target.value)} className="minimal-select">
                            <option>Overall Performance</option>
                            <option>Academic Performance</option>
                            <option>Training Performance</option>
                            <option>Events Performance</option>
                            <option>Skills Performance</option>
                            <option>Sports Performance</option>
                            <option>Hostel Performance</option>
                            <option>Personal Performance</option>
                          </select>
                          <select value={analyticsYear} onChange={(e) => setAnalyticsYear(e.target.value)} className="minimal-select">
                            <option>All Years</option>
                            <option>1st Year</option>
                            <option>2nd Year</option>
                            <option>3rd Year</option>
                            <option>4th Year</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="chart-header">Overall Dashboard Performance</div>
                    )}
                    
                    <div className="bar-container">
                        {dist.map(d => (
                            <div className="bar-wrapper" key={d.label}>
                                <span className="bar-percentage">{d.percentage}%</span>
                                <div className="bar-fill" style={{ height: `${Math.max(d.height, 5)}%`, backgroundColor: d.color }}></div>
                                <span className="bar-label">{d.label}</span>
                            </div>
                        ))}
                    </div>

                    {activeMenu === "analytics" && (
                        <div className="key-insights-wrapper" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                            <div className="insight-item" style={{ padding: "12px", background: "#0f172a", borderRadius: "8px", border: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "15px" }}>
                                <div style={{ background: "#fef3c7", padding: "8px", borderRadius: "50%", color: "#d97706" }}><FiAward /></div>
                                <div>
                                    <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>Most Appreciated Event</p>
                                    <h4 style={{ margin: "2px 0 0", color: "#f8fafc" }}>{best.title}</h4>
                                    <span style={{ fontSize: "12px", color: "#d97706" }}>★ {best.avg}</span>
                                </div>
                            </div>
                            <div className="insight-item" style={{ padding: "12px", background: "#0f172a", borderRadius: "8px", border: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "15px" }}>
                                <div style={{ background: "#fee2e2", padding: "8px", borderRadius: "50%", color: "#dc2626" }}><FiAlertTriangle /></div>
                                <div>
                                    <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>Most Criticized Event</p>
                                    <h4 style={{ margin: "2px 0 0", color: "#f8fafc" }}>{worst.title}</h4>
                                    <span style={{ fontSize: "12px", color: "#dc2626" }}>★ {worst.avg}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="chart-box" style={activeMenu === 'analytics' ? { display: 'flex !important', flexDirection: 'column !important', height: '100% !important', justifyContent: 'center !important' } : {}}>
                  <div className="chart-header"><span>Sentiment Analysis</span></div>
                  
                  <div className="sentiment-content" style={activeMenu === 'analytics' ? { 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      padding: '10px'
                  } : {}}>
                      
                      <div className="pie-wrapper" style={activeMenu === 'analytics' ? { 
                          width: '160px', height: '160px', marginBottom: '20px'
                      } : {}}>
                          <div className="pie-chart-solid" style={{ background: `conic-gradient(#22c55e 0% ${posP}%, #f59e0b ${posP}% ${posP + neuP}%, #ef4444 ${posP + neuP}% 100%)` }}></div>
                      </div>
                      
                      <div className="sentiment-legend-boxed" style={activeMenu === 'analytics' ? { 
                          width: '90%'
                      } : {}}>
                          <div className="legend-box-item"><span className="dot pos"></span> Positive <b className="val-text">{posP}%</b></div>
                          <div className="legend-box-item"><span className="dot neu"></span> Neutral <b className="val-text">{neuP}%</b></div>
                          <div className="legend-box-item"><span className="dot neg"></span> Negative <b className="val-text">{negP}%</b></div>
                      </div>
                  </div>
                </div>
            </div>
          </div>
        )}

        {activeMenu === "view" && (
          <div className="view-feedback-section">
            <div className="filter-bar-container">
              <div className="filter-block">
                <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="">Feedback Type</option>
                  <option>Academic</option><option>Training</option><option>Skills</option><option>Events</option><option>Sports</option><option>Hostel</option><option>Personal</option>
                </select>
              </div>
              <div className="filter-block">
                <select className="filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                  <option value="">Department</option>
                  <option>Computer Science</option><option>Information Technology</option><option>Electronics</option><option>Mechanical</option>
                </select>
              </div>
              <div className="filter-block">
                <select className="filter-select" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                  <option value="">Year</option>
                  <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                </select>
              </div>
              <div className="filter-search-block">
                <FiSearch color="#94a3b8" />
                <input type="text" placeholder="Search Course..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead><tr><th>Type</th><th>Course / Training / Skill</th><th>Faculty</th><th>Rating</th><th>Suggestion</th><th>Date</th></tr></thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item._id}>
                      <td className="td-type">{item.feedbackType || item.type || "N/A"}</td>
                      <td className="td-course">{item.title}</td>
                      <td className="td-faculty">{item.facultyName || item.faculty || "N/A"}</td>
                      <td className={`td-rating ${getRatingClass(item.rating)}`}>{item.rating}</td>
                      <td className="td-suggestions">{item.suggestions}</td>
                      <td className="td-date">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === "recent" && (
          <div className="view-feedback-section">
            <div className="filter-bar-container">
              <div className="filter-block">
                <input type="date" className="filter-select" style={{color: 'white'}} value={recentDate} onChange={e => setRecentDate(e.target.value)} />
              </div>
              <div className="filter-block">
                <select className="filter-select" value={recentYear} onChange={e => setRecentYear(e.target.value)}>
                  <option value="">Year</option>
                  <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                </select>
              </div>
              <div className="filter-block">
                <select className="filter-select" value={recentType} onChange={e => setRecentType(e.target.value)}>
                  <option value="">Feedback Type</option>
                  <option>Academic</option><option>Training</option><option>Skills</option><option>Events</option><option>Sports</option><option>Hostel</option><option>Personal</option>
                </select>
              </div>
              <div className="filter-search-block">
                <FiSearch color="#94a3b8" />
                <input type="text" placeholder="Search Student..." value={recentSearch} onChange={e => setRecentSearch(e.target.value)} />
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Student Name</th><th>Student ID</th><th>Date & Time</th><th>Year</th><th>Feedback Type</th></tr>
                </thead>
                <tbody>
                  {recentFiltered.map(item => (
                    <tr key={item._id}>
                      <td className="td-student">{item.studentName || "Anonymous"}</td>
                      <td className="td-student">{studentIdByEmail[item.email] || "N/A"}</td>
                      <td className="td-date">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}</td>
                      <td className="td-year">{item.year || "N/A"}</td>
                      <td className="td-type">{item.feedbackType || item.type || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === "review" && (
          <div className="view-feedback-section">
            <div className="filter-bar-container">
              <div className="filter-search-block">
                <FiSearch color="#94a3b8" />
                <input type="text" placeholder="Review specific feedback..." value={reviewSearch} onChange={e => setReviewSearch(e.target.value)} />
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Student ID</th><th>Feedback Type</th><th>Course</th><th>Rating</th><th>Date & Time</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                   {feedbacks.filter(f => (f.title || "").toLowerCase().includes(reviewSearch.toLowerCase())).map(item => {
                    const hasResponse = (item.response || "").trim().length > 0;
                    return (
                      <tr key={item._id}>
                        <td className="td-student">{studentIdByEmail[item.email] || "N/A"}</td>
                        <td className="td-type">{item.feedbackType || item.type || "N/A"}</td>
                        <td className="td-course">{item.title || "N/A"}</td>
                        <td className={`td-rating ${getRatingClass(item.rating)}`}>{item.rating}</td>
                        <td className="td-date">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}</td>
                        <td>
                          <span className={`status-pill ${hasResponse ? 'reviewed' : 'pending'}`}>
                            {hasResponse ? "Reviewed" : "Pending"}
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

        {activeMenu === "addFaculty" && (
          <div className="add-faculty-page">
            <div className="add-faculty-card">
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                <FiUserPlus style={{ fontSize: "28px", color: "#3b82f6" }} />
              </div>
              <h3 className="add-faculty-title">Create User</h3>

              <form autoComplete="off" onSubmit={handleAddUser}>
                <div className="add-faculty-field">
                  <label className="add-faculty-label">Role</label>
                  <select className="add-faculty-input" value={userRole} onChange={(e) => setUserRole(e.target.value)}>
                    <option>Student</option>
                    <option>Faculty</option>
                  </select>
                </div>

                {userRole === "Student" ? (
                  <>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div className="add-faculty-field" style={{ flex: 1 }}>
                        <label className="add-faculty-label">Name</label>
                        <input className="add-faculty-input" type="text" autoComplete="off" placeholder="Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                      </div>
                      <div className="add-faculty-field" style={{ flex: 1 }}>
                        <label className="add-faculty-label">Student ID</label>
                        <input className="add-faculty-input" type="text" autoComplete="off" placeholder="Student ID" value={userStudentId} onChange={(e) => setUserStudentId(e.target.value)} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                      <div className="add-faculty-field" style={{ flex: 1 }}>
                        <label className="add-faculty-label">Department</label>
                        <select className="add-faculty-input" value={userDepartment} onChange={(e) => setUserDepartment(e.target.value)}>
                          <option value="">Select Department</option>
                          <option>Information Technology</option>
                          <option>Computer Science</option>
                          <option>ECE</option>
                        </select>
                      </div>
                      <div className="add-faculty-field" style={{ flex: 1 }}>
                        <label className="add-faculty-label">Semester</label>
                        <select className="add-faculty-input" value={userSemester} onChange={(e) => setUserSemester(e.target.value)}>
                          <option value="">Select Semester</option>
                          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={`Sem ${s}`}>Semester {s}</option>)}
                        </select>
                      </div>
                      <div className="add-faculty-field" style={{ flex: 1 }}>
                        <label className="add-faculty-label">Year</label>
                        <select className="add-faculty-input" value={userYear} onChange={(e) => setUserYear(e.target.value)}>
                          <option value="">Select Year</option>
                          <option>1st Year</option>
                          <option>2nd Year</option>
                          <option>3rd Year</option>
                          <option>4th Year</option>
                        </select>
                      </div>
                    </div>

                    <div className="add-faculty-field">
                      <label className="add-faculty-label">Email</label>
                      <input className="add-faculty-input" type="email" autoComplete="off" placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                    </div>

                    <div className="add-faculty-field">
                      <label className="add-faculty-label">Password</label>
                      <input className="add-faculty-input" type="password" autoComplete="new-password" placeholder="Password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="add-faculty-field">
                      <label className="add-faculty-label">Name</label>
                      <input className="add-faculty-input" type="text" autoComplete="off" placeholder="Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                    </div>

                    <div className="add-faculty-field">
                      <label className="add-faculty-label">Email</label>
                      <input className="add-faculty-input" type="email" autoComplete="off" placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                    </div>

                    <div className="add-faculty-field">
                      <label className="add-faculty-label">Password</label>
                      <input className="add-faculty-input" type="password" autoComplete="new-password" placeholder="Password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
                    </div>
                  </>
                )}

                <button className="add-faculty-button" type="submit">Save</button>
              </form>
            </div>
          </div>
        )}

        {selectedFeedback && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h2>View Feedback: {selectedFeedback.title || "Feedback"}</h2>
                <button className="close-btn" onClick={() => setSelectedFeedback(null)}><FiX /></button>
              </div>
              <div className="modal-body">
                <div className="feedback-meta">
                  <div><label>Feedback Type</label><p>{selectedFeedback.feedbackType || selectedFeedback.type || "N/A"}</p></div>
                  <div><label>Course</label><p>{selectedFeedback.title || "N/A"}</p></div>
                  <div><label>Date & Time</label><p>{selectedFeedback.createdAt ? new Date(selectedFeedback.createdAt).toLocaleString() : "N/A"}</p></div>
                  <div><label>Responded At</label><p>{selectedFeedback.responseAt ? new Date(selectedFeedback.responseAt).toLocaleString() : "N/A"}</p></div>
                </div>
                <div className="field-group">
                  <label>Suggestion</label>
                  <div className="suggestion-display">{selectedFeedback.suggestions || "No suggestion provided."}</div>
                </div>
                <div className="field-group">
                  <label>Response</label>
                  <div className="suggestion-display">{selectedFeedback.response || "No response yet"}</div>
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

export default AdminDashboard;
