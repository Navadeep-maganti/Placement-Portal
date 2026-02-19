import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import "../styles/css/login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [loginType, setLoginType] = useState(
    searchParams.get("type") || "student"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const auth = useAuth();
  if (auth.auth.access) {
    navigate("/");
  }
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    try {
      const loginbtn = document.querySelector(".login-btn");
      loginbtn.disabled = true;
      loginbtn.textContent = "Signing in...";
      loginbtn.style.cursor = "not-allowed";
      loginbtn.style.backgroundColor = "#ccc";
      loginbtn.style.borderColor = "#999";
      const res = await axios.post("http://127.0.0.1:8000/api/token/", {
        email: email,
        password: password,
      });


      const { role } = res.data;

      if (loginType === "student" && role !== "student") {
        setError("This is not a student account. Please use the recruiter login.");
        return;
      }

      if (loginType === "company" && role !== "company") {
        setError("This is not a recruiter account. Please use the student login.");
        return;
      }

      login(res.data);

      if (role === "student") {
        navigate(`/student/dashboard`);
      } else if (role === "company") {
        navigate("/company/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      }

    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response?.data?.detail || "Invalid credentials. Please check your username and password.");
      } else if (err.response?.status === 401) {
        setError("Invalid username or password");
      } else if (err.response?.status === 404) {
        setError("User not found. Please check your username.");
      } else if (err.message === "Network Error") {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Login failed. Please try again later.");
      }
      console.error("Login error:", err.response?.data || err.message);
    }
    finally {
      const loginbtn = document.querySelector(".login-btn");
      loginbtn.disabled = false;
      loginbtn.textContent = "Sign In";
      loginbtn.style.cursor = "pointer";
      loginbtn.style.backgroundColor = "#007bff";
      loginbtn.style.borderColor = "#007bff";

    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1 className="login-title">
          {loginType === "student" ? "Student Login" : "Recruiter Login"}
        </h1>

        <div className="role-toggle">
          <button
            type="button"
            className={loginType === "student" ? "active" : ""}
            onClick={() => setLoginType("student")}
          >
            Student
          </button>
          <button
            type="button"
            className={loginType === "company" ? "active" : ""}
            onClick={() => setLoginType("company")}
          >
            Recruiter
          </button>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Username or Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="error-container">
              <p className="error-text">{error}</p>
            </div>
          )}

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;
