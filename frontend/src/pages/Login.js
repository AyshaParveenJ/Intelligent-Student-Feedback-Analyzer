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

      if (res.data.role === "admin") {
        window.location.href = "/faculty";
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

        {isSignup && (
          <input
            type="text"
            placeholder="Full Name"
            onChange={(e) => setFullName(e.target.value)}
          />
        )}

        <input
          type="text"
          placeholder="Email Address"
          onChange={(e) => setStudentId(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {isSignup ? (
          <button onClick={handleSignup}>SIGN UP</button>
        ) : (
          <button onClick={handleLogin}>SIGN IN</button>
        )}

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