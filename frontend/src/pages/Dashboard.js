import { useState, useEffect } from "react";
import {
  FiHome,
  FiEdit,
  FiCpu,
  FiBell,
  FiUser,
  FiHelpCircle,
  FiChevronDown
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
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

  // Load user + department/year
  useEffect(() => {
  const name = localStorage.getItem("fullName");
  const dept = localStorage.getItem("department");
  const yr = localStorage.getItem("year");

  if (name) setStudentName(name);

  // Store saved values (for display after saving)
  if (dept) setSavedDept(dept);
  if (yr) setSavedYear(yr);

  // 🔥 Always reset dropdown to default
  setDepartment("");
  setYear("");

  // Always show modal on login
  setShowModal(true);

}, []);

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
  };

  return (
    <div className="dashboard-container">

      {/* ===== SIDEBAR ===== */}
      <div className="sidebar">
        <h3>Main Menu</h3>
        <ul>
          <li onClick={() => navigate("/dashboard")}>
            <FiHome className="icon" /> Dashboard
          </li>

          <li onClick={() => setShowFeedbackMenu(!showFeedbackMenu)}>
            <FiEdit className="icon" />
            Give Feedback
            <FiChevronDown className="dropdown-icon" />
          </li>

          {showFeedbackMenu && (
            <ul className="submenu">
              <li onClick={() => navigate("/academic")}>Academic</li>
              <li onClick={() => navigate("/training")}>Training</li>
              <li onClick={() => navigate("/skills")}>Skills</li>
              <li onClick={() => navigate("/events")}>Events</li>
            </ul>
          )}

          <li><FiCpu className="icon" /> AI Suggestions</li>
          <li><FiBell className="icon" /> Notifications</li>
          <li><FiUser className="icon" /> My Profile</li>
          <li><FiHelpCircle className="icon" /> Help</li>
        </ul>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="main-content">
        <h2>Welcome, {studentName} 👋</h2>

        {savedDept && savedYear && (
          <div style={{ marginTop: "15px" }}>
            <p>
              {savedDept} - {savedYear}
              {" "}
              <span
                style={{
                  marginLeft: "15px",
                  color: "#3b82f6",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
                onClick={() => setShowModal(true)}
              >
                ✎ Edit
              </span>
            </p>
          </div>
        )}
      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Set Your Details</h3>
            <p>Select your Department and Year</p>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Select Department</option>
              <option>Computer Science</option>
              <option>Information Technology</option>
              <option>Electronics</option>
              <option>Mechanical</option>
            </select>

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Select Year</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>

            <div className="modal-buttons">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;