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
      <div className="portal-card">
        <h2>Portal Login</h2>

        {/* Wrapping in a form with autoComplete="off" prevents the browser 
            from injecting saved usernames/passwords automatically.
        */}
        <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Email Address"
            autoComplete="one-time-code" 
            /* "one-time-code" is a trick to stop aggressive browser autofill */
            onChange={(e) => setStudentId(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            autoComplete="new-password" 
            /* "new-password" prevents the browser from suggesting saved passwords */
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="button" onClick={handleLogin}>SIGN IN</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
