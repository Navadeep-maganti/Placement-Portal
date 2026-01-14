import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import "../assets/css/login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  // UI state
  const [loginType, setLoginType] = useState(
    searchParams.get("type") || "student"
  );

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Template animation logic (unchanged)
  useEffect(() => {
    const registerBtn = document.getElementById("registerBtn");
    const loginBtn = document.getElementById("loginBtn");
    const authWrapper = document.getElementById("authWrapper");

    registerBtn?.addEventListener("click", () =>
      authWrapper.classList.add("panel-active")
    );

    loginBtn?.addEventListener("click", () =>
      authWrapper.classList.remove("panel-active")
    );

    return () => {
      registerBtn?.replaceWith(registerBtn.cloneNode(true));
      loginBtn?.replaceWith(loginBtn.cloneNode(true));
    };
  }, []);

  // 🔐 LOGIN HANDLER
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("login/", {
        username: email,
        password: password,
      });

      const { role } = res.data;

      // ❌ Role mismatch protection
      if (loginType === "student" && role !== "student") {
        setError("This is not a student account");
        return;
      }

      if (loginType === "company" && role !== "company") {
        setError("This is not a recruiter account");
        return;
      }

      // ✅ Save auth
      login(res.data);

      // ✅ Redirect
      if (role === "student") {
        navigate(`/student/dashboard`);
      } else if (role === "company") {
        navigate("/company/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      }

    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="auth-wrapper" id="authWrapper">

      {/* ================= LOGIN FORM ================= */}
      <div className="auth-form-box login-form-box">
        <form onSubmit={handleLogin}>
          <h1>
            {loginType === "student" ? "Student Login" : "Recruiter Login"}
          </h1>

          {/* 🔘 ROLE TOGGLE (UI ONLY) */}
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

          <input
            type="text"
            placeholder="Username / Email"
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

          {error && <p className="error-text">{error}</p>}

          <button type="submit">Sign In</button>
        </form>
      </div>

      {/* ================= SLIDING PANEL ================= */}
      <div className="slide-panel-wrapper">
        <div className="slide-panel">

          <div className="panel-content panel-content-left">
            <h1>Welcome Back!</h1>
            <p>
              Login to continue your placement journey
            </p>
            <button className="transparent-btn" id="loginBtn">
              Sign In
            </button>
          </div>

          <div className="panel-content panel-content-right">
            <h1>Hey There!</h1>
            <p>
              Register and explore opportunities
            </p>
            <button className="transparent-btn" id="registerBtn">
              Sign Up
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
