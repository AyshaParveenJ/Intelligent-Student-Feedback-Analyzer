import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiHome,
  FiClipboard,
  FiUsers,
  FiBarChart2,
  FiLogOut,
  FiSearch
} from "react-icons/fi";
import "./FacultyDashboard.css";

function FacultyDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [typeFilter, setTypeFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feedbacks, typeFilter, deptFilter, yearFilter, search]);

  const fetchFeedback = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback/all");
      setFeedbacks(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const applyFilters = () => {
    let data = [...feedbacks];

    if (typeFilter) {
      data = data.filter(f => f.feedbackType === typeFilter);
    }

    if (deptFilter) {
      data = data.filter(f => f.department === deptFilter);
    }

    if (yearFilter) {
      data = data.filter(f => f.year === yearFilter);
    }

    if (search) {
      data = data.filter(f =>
        f.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(data);
  };

  const deleteFeedback = async (id) => {
    await axios.delete(`http://localhost:5000/api/feedback/${id}`);
    fetchFeedback();
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h3>Main Menu</h3>
        <ul>
          <li onClick={() => setActiveMenu("dashboard")}>
            <FiHome className="icon" /> Dashboard
          </li>
          <li onClick={() => setActiveMenu("view")}>
            <FiClipboard className="icon" /> View Feedback
          </li>
          <li><FiUsers className="icon" /> Students</li>
          <li><FiBarChart2 className="icon" /> Analytics</li>
          <li><FiLogOut className="icon" /> Logout</li>
        </ul>
      </div>

      {/* MAIN */}
      <div className="main-content">
        <h2>Welcome, Admin 👋</h2>

        {activeMenu === "view" && (
          <>
            {/* FILTER BAR */}
            <div className="filter-bar">
              <select onChange={e => setTypeFilter(e.target.value)}>
                <option value="">Feedback Type</option>
                <option>Academic</option>
                <option>Training</option>
                <option>Skills</option>
                <option>Events</option>
              </select>

              <select onChange={e => setDeptFilter(e.target.value)}>
                <option value="">Department</option>
                <option>Computer Science</option>
                <option>Information Technology</option>
                <option>Electronics</option>
                <option>Mechanical</option>
              </select>

              <select onChange={e => setYearFilter(e.target.value)}>
                <option value="">Year</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>

              <div className="search-box">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search Course..."
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* TABLE */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Course / Training / Skill</th>
                    <th>Faculty</th>
                    <th>Rating</th>
                    <th>Suggestions</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item._id}>
                      <td>{item.feedbackType}</td>
                      <td>{item.title}</td>
                      <td>{item.facultyName}</td>
                      <td>
                        {"⭐".repeat(
                          ["Poor","Fair","Good","Very Good","Excellent"]
                          .indexOf(item.rating)+1
                        )}
                      </td>
                      <td>{item.suggestions}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => deleteFeedback(item._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FacultyDashboard;