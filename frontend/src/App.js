import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FeedbackForm from "./pages/FeedbackForm";
import Login from "./pages/Login";
import FacultyDashboard from "./pages/FacultyDashboard";

function App() {
  return (
    <Router>
      <Routes>

        {/* Default Login Page */}
        <Route path="/" element={<Login />} />

        {/* Student Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Faculty Dashboard */}
        <Route path="/faculty" element={<FacultyDashboard />} />

        {/* Separate Feedback Pages */}
        <Route path="/academic" element={<FeedbackForm type="Academic" />} />
        <Route path="/training" element={<FeedbackForm type="Training" />} />
        <Route path="/skills" element={<FeedbackForm type="Skills" />} />
        <Route path="/events" element={<FeedbackForm type="Events" />} />

        {/* If user types wrong URL */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;