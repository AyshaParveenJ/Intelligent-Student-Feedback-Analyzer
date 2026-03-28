import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FeedbackForm from "./pages/FeedbackForm";
import Login from "./pages/Login";
import AdminDashboard from "./pages/adminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";

function App() {
  return (
    <Router>
      <Routes>

        {/* Default Login Page */}
        <Route path="/" element={<Login />} />

        {/* Student Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Dashboard */}
        <Route path="/faculty" element={<AdminDashboard />} />

        {/* Faculty Dashboard */}
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />

        {/* Separate Feedback Pages */}
        <Route path="/academic" element={<FeedbackForm type="Academic" />} />
        <Route path="/training" element={<FeedbackForm type="Training" />} />
        <Route path="/skills" element={<FeedbackForm type="Skills" />} />
        <Route path="/events" element={<FeedbackForm type="Events" />} />
        <Route path="/sports" element={<FeedbackForm type="Sports" />} />
        <Route path="/hostel" element={<FeedbackForm type="Hostel" />} />
        <Route path="/personal" element={<FeedbackForm type="Personal" />} />

        {/* If user types wrong URL */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;
