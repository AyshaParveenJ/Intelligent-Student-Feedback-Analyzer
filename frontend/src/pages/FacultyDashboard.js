import { useEffect, useState } from "react";
import { FiHome, FiLogOut } from "react-icons/fi";
import "./adminDashboard.css";

function FacultyDashboard() {
  const [facultyName, setFacultyName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("fullName");
    if (name) setFacultyName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Main Menu</h3>
        <ul>
          <li className="active-link"><FiHome /> Dashboard</li>
          <li className="logout-item" onClick={handleLogout} style={{ cursor: "pointer" }}><FiLogOut /> Logout</li>
        </ul>
      </div>

      <div className="main-content">
        <div className="admin-header-flex">
          <h2>Faculty Dashboard</h2>
        </div>
        <div className="view-feedback-section">
          <h3>Welcome, {facultyName || "Faculty"}</h3>
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;
