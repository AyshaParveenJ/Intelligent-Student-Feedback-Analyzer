import { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "https://student-feedback-backend-bia4.onrender.com/api/auth/login",
        { studentId, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("fullName", res.data.fullName || "Admin");
      localStorage.setItem("loginEmail", studentId);

      if (res.data.role === "admin") {
        window.location.href = "/faculty";
      } else if (res.data.role === "faculty") {
        window.location.href = "/faculty-dashboard";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="portal-container">

      <div className="center-frame">

        {/* LEFT CONTENT */}
        <div className="left-panel">
          <h1>
            Welcome to the <span>Portal</span>
          </h1>

          <p>
            Sign in to access insights, analyze feedback, and drive meaningful improvements.
          </p>

          <div className="features">
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div>
                <strong>Data-Driven Insights</strong><br />
                Analyze feedback with smart visualizations
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🔐</div>
              <div>
                <strong>Secure & Reliable</strong><br />
                Your data is protected with enterprise-grade security
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">👥</div>
              <div>
                <strong>For Everyone</strong><br />
                One portal for Admins, Students, and Faculty
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN */}
        <div className="right-panel">
          <div className="portal-card">
            <h2>Login</h2>

            <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Email Address"
                autoComplete="one-time-code"
                onChange={(e) => setStudentId(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <button type="button" onClick={handleLogin}>
                SIGN IN
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Login;