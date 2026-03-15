import { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
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

  const handleSignup = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        { fullName, studentId, password }
      );

      alert("Account Created Successfully");
      setIsSignup(false);

    } catch (error) {
      alert(error.response?.data?.message || "Signup Failed");
    }
  };

  return (
    <div className="portal-container">
      <div className="portal-card">
        <h2>{isSignup ? "Create Account" : "Portal Login"}</h2>

        {/* Wrapping in a form with autoComplete="off" prevents the browser 
            from injecting saved usernames/passwords automatically.
        */}
        <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
          {isSignup && (
            <input
              type="text"
              placeholder="Full Name"
              autoComplete="off"
              onChange={(e) => setFullName(e.target.value)}
            />
          )}

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

          {isSignup ? (
            <button type="button" onClick={handleSignup}>SIGN UP</button>
          ) : (
            <button type="button" onClick={handleLogin}>SIGN IN</button>
          )}
        </form>

        <p onClick={() => setIsSignup(!isSignup)}>
          {isSignup
            ? "Back to Sign In"
            : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );
}

export default Login;
