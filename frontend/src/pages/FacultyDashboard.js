import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiHome, FiClipboard, FiUsers, FiBarChart2, FiLogOut, FiSearch,
  FiMessageSquare, FiStar, FiCalendar, FiThumbsUp, FiFilter, FiClock
} from "react-icons/fi";
import "./FacultyDashboard.css";

function FacultyDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  
  // View Feedback States
  const [typeFilter, setTypeFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [search, setSearch] = useState("");

  // Recent Feedback States
  const [recentDate, setRecentDate] = useState("");
  const [recentYear, setRecentYear] = useState("");
  const [recentType, setRecentType] = useState(""); 
  const [recentSearch, setRecentSearch] = useState("");
  const [recentFiltered, setRecentFiltered] = useState([]);

  useEffect(() => { fetchFeedback(); }, []);
  
  // NEW: Logic for real-time filtering in View Feedback section
  useEffect(() => {
    if (activeMenu === "view") {
      applyFilters();
    }
  }, [typeFilter, deptFilter, yearFilter, search, feedbacks, activeMenu]);

  // Logic for real-time filtering in Recent Feedback section
  useEffect(() => {
    if (activeMenu === "recent") {
      applyRecentFilters();
    }
  }, [recentSearch, recentDate, recentYear, recentType, feedbacks, activeMenu]);

  useEffect(() => { 
    setFiltered(feedbacks); 
    setRecentFiltered(feedbacks.slice(0, 5)); 
  }, [feedbacks]);

  const fetchFeedback = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback/all");
      setFeedbacks(res.data);
    } catch (error) { console.log(error); }
  };

  const applyFilters = () => {
    let data = [...feedbacks];
    if (typeFilter) data = data.filter(f => (f.feedbackType === typeFilter || f.type === typeFilter));
    if (deptFilter) data = data.filter(f => f.department === deptFilter);
    if (yearFilter) data = data.filter(f => f.year === yearFilter);
    if (search) data = data.filter(f => (f.title || "").toLowerCase().includes(search.toLowerCase()));
    setFiltered(data);
  };

  const applyRecentFilters = () => {
    let data = [...feedbacks];

    if (recentSearch) {
      data = data.filter(f => 
        (f.studentName || "").toLowerCase().includes(recentSearch.toLowerCase())
      );
    }
    if (recentDate) {
      data = data.filter(f => new Date(f.createdAt).toISOString().split('T')[0] === recentDate);
    }
    if (recentYear) data = data.filter(f => f.year === recentYear);
    if (recentType) {
        data = data.filter(f => (f.feedbackType === recentType || f.type === recentType));
    }
    
    setRecentFiltered(data);
  };

  const ratingsMap = { "Poor": 1, "Fair": 2, "Good": 3, "Very Good": 4, "Excellent": 5 };
  const total = feedbacks.length;
  const avgRating = total > 0 
    ? (feedbacks.reduce((acc, curr) => acc + (ratingsMap[curr.rating] || 0), 0) / total).toFixed(1)
    : "0.0";

  const feedbackCategories = [
    { label: "Poor", color: "#ef4444" },
    { label: "Fair", color: "#f97316" },
    { label: "Very Good", color: "#fbbf24" },
    { label: "Good", color: "#4ade80" },
    { label: "Excellent", color: "#22d3ee" }
  ];

  const dist = feedbackCategories.map(cat => {
    const count = feedbacks.filter(f => f.rating === cat.label).length;
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
    return { ...cat, percentage, height: total > 0 ? (count / total) * 100 : 0 };
  });

  const positive = feedbacks.filter(f => ["Very Good", "Excellent"].includes(f.rating)).length;
  const neutral = feedbacks.filter(f => f.rating === "Good").length;
  const negative = feedbacks.filter(f => ["Poor", "Fair"].includes(f.rating)).length;

  const getPercent = (count) => (total > 0 ? Math.round((count / total) * 100) : 0);
  const posP = getPercent(positive);
  const neuP = getPercent(neutral);
  const negP = getPercent(negative);

  const getRatingClass = (rating) => {
    if (!rating) return "";
    const r = rating.toLowerCase();
    if (r.includes("very good") || r.includes("excellent")) return "rating-very-good";
    if (r.includes("good")) return "rating-good";
    if (r.includes("fair")) return "rating-fair";
    if (r.includes("poor")) return "rating-poor";
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
          <li><FiUsers /> Students</li>
          <li><FiBarChart2 /> Analytics</li>
          <li className="logout-item"><FiLogOut /> Logout</li>
        </ul>
      </div>

      <div className="main-content">
        {activeMenu === "dashboard" && (
          <div className="admin-header-flex">
              <h2>Welcome, Admin 👋</h2>
              <div className="top-search"><FiSearch /><input type="text" placeholder="Search" /></div>
          </div>
        )}

        {activeMenu === "dashboard" && (
          <div className="admin-front-page">
            <div className="admin-stats-grid">
              <div className="stat-card-admin"><div className="stat-icon-box bg-blue"><FiMessageSquare /></div><div><p className="stat-label">Total Feedback</p><h4 className="stat-value">{total}</h4></div></div>
              <div className="stat-card-admin"><div className="stat-icon-box bg-green"><FiStar /></div><div><p className="stat-label">Average Rating</p><h4 className="stat-value">{avgRating} <span className="stars-small">⭐⭐⭐⭐</span></h4></div></div>
              <div className="stat-card-admin"><div className="stat-icon-box bg-purple"><FiCalendar /></div><div><p className="stat-label">Events Reviewed</p><h4 className="stat-value">12</h4></div></div>
              <div className="stat-card-admin"><div className="stat-icon-box bg-orange"><FiThumbsUp /></div><div><p className="stat-label">Positive Feedback</p><h4 className="stat-value">{posP}%</h4></div></div>
            </div>
            <div className="charts-row">
                <div className="chart-box">
                    <div className="chart-header">Overall Feedback Percentage</div>
                    <div className="bar-container">
                        {dist.map(d => (
                            <div className="bar-wrapper" key={d.label}>
                                <span className="bar-percentage">{d.percentage}%</span>
                                <div className="bar-fill" style={{ height: `${Math.max(d.height, 5)}%`, backgroundColor: d.color }}></div>
                                <span className="bar-label">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="chart-box">
                    <div className="chart-header"><span>Sentiment Analysis</span></div>
                    <div className="sentiment-content">
                        <div className="pie-wrapper"><div className="pie-chart-solid" style={{ background: `conic-gradient(#22c55e 0% ${posP}%, #f59e0b ${posP}% ${posP + neuP}%, #ef4444 ${posP + neuP}% 100%)` }}></div></div>
                        <div className="sentiment-legend-boxed">
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
                  <option>Academic</option><option>Training</option><option>Skills</option><option>Events</option>
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
              {/* Filter button removed for real-time updates */}
            </div>
            <div className="table-container">
              <table>
                <thead><tr><th>Type</th><th>Course / Training / Skill</th><th>Faculty</th><th>Rating</th><th>Suggestions</th></tr></thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item._id}>
                      <td className="td-type">{item.feedbackType || item.type || "N/A"}</td>
                      <td className="td-course">{item.title}</td>
                      <td className="td-faculty">{item.facultyName || item.faculty || "N/A"}</td>
                      <td className={`td-rating ${getRatingClass(item.rating)}`}>{item.rating}</td>
                      <td className="td-suggestions">{item.suggestions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p style={{color: 'white', textAlign: 'center', marginTop: '20px'}}>No matching records found.</p>
              )}
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
                  <option>Academic</option>
                  <option>Training</option>
                  <option>Skills</option>
                  <option>Events</option>
                </select>
              </div>
              <div className="filter-search-block">
                <FiSearch color="#94a3b8" />
                <input 
                  type="text" 
                  placeholder="Search Student..." 
                  value={recentSearch}
                  onChange={e => setRecentSearch(e.target.value)} 
                />
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Date & Time</th>
                    <th>Year</th>
                    <th>Semester</th>
                    <th>Feedback Type</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFiltered.map(item => (
                    <tr key={item._id}>
                      <td className="td-student">{item.studentName || "Anonymous"}</td>
                      <td className="td-date">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}</td>
                      <td className="td-year">{item.year || "N/A"}</td>
                      <td className="td-sem">{item.semester || item.sem || "N/A"}</td>
                      <td className="td-type">{item.feedbackType || item.type || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentFiltered.length === 0 && (
                <p style={{color: 'white', textAlign: 'center', marginTop: '20px'}}>No matching feedback found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FacultyDashboard;