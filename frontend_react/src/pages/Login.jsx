import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import "../styles/css/login.css";

const emptyRegisterForm = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
  company_name: "",
  location: "",
  industry: "",
  website: "",
  description: "",
};

function Login() {
  const navigate = useNavigate();
  const { auth, login } = useAuth();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get("type") === "company" ? "company" : "student";
  const initialView =
    initialRole === "company" && searchParams.get("view") === "register"
      ? "register"
      : "login";

  const [loginType, setLoginType] = useState(initialRole);
  const [authView, setAuthView] = useState(initialView);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (auth.access) {
      navigate("/");
    }
  }, [auth.access, navigate]);

  const handleRoleChange = (nextRole) => {
    setLoginType(nextRole);
    setError("");
    setInfo("");
    if (nextRole === "student") {
      setAuthView("login");
    }
  };

  const handleViewChange = (nextView) => {
    setAuthView(nextView);
    setError("");
    setInfo("");
  };

  const handleLoginInputChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setInfo("");
  };

  const handleRegisterInputChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setInfo("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post("http://127.0.0.1:8000/api/token/", {
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      const { role } = response.data;

      if (role === "admin") {
        await login(response.data);
        navigate("/admin/dashboard");
        return;
      }

      if (loginType === "student" && role !== "student") {
        setError("This account belongs to a recruiter. Switch to recruiter sign in.");
        return;
      }

      if (loginType === "company" && role !== "company") {
        setError("This account belongs to a student. Switch to student sign in.");
        return;
      }

      const userData = await login(response.data);

      if (role === "student") {
        navigate("/student/dashboard");
        return;
      }

      if (userData?.is_approved) {
        navigate("/company/dashboard");
        return;
      }

      navigate("/company/profile", {
        state: {
          message:
            "Your recruiter account is awaiting admin approval. You can complete your profile while approval is under review.",
        },
      });
    } catch (err) {
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.detail ||
            "Invalid credentials. Please check your email and password."
        );
      } else if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.message === "Network Error") {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Login failed. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (registerForm.password !== registerForm.confirm_password) {
      setError("Password confirmation does not match.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/companies/register/",
        {
          ...registerForm,
          email: registerForm.email.trim(),
          website: registerForm.website.trim(),
        }
      );

      setInfo(
        response.data?.detail ||
          "Recruiter account created successfully. Admin approval is pending."
      );
      setAuthView("login");
      setLoginForm({ email: registerForm.email.trim(), password: "" });
      setRegisterForm(emptyRegisterForm);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const firstError = Object.values(data)
          .flat()
          .find(Boolean);
        setError(firstError || "Unable to create recruiter account.");
      } else if (err.message === "Network Error") {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Unable to create recruiter account right now. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-topbar">
          <Link to="/" className="login-home-link">
            Back to Home
          </Link>
        </div>

        <p className="login-eyebrow">Placement Portal</p>
        <h1 className="login-title">
          {loginType === "student"
            ? "Student Login"
            : authView === "register"
              ? "Recruiter Registration"
              : "Recruiter Login"}
        </h1>

        <div className="role-toggle">
          <button
            type="button"
            className={loginType === "student" ? "active" : ""}
            onClick={() => handleRoleChange("student")}
          >
            Student
          </button>
          <button
            type="button"
            className={loginType === "company" ? "active" : ""}
            onClick={() => handleRoleChange("company")}
          >
            Recruiter
          </button>
        </div>

        {info && (
          <div className="info-container">
            <p className="info-text">{info}</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p className="error-text">{error}</p>
          </div>
        )}

        {loginType === "student" || authView === "login" ? (
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={loginForm.email}
              onChange={handleLoginInputChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={handleLoginInputChange}
              required
            />

            {loginType === "company" && (
              <p className="login-hint">
                New recruiter accounts need admin approval.
              </p>
            )}

            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? "Signing In..." : "Sign In"}
            </button>

            {loginType === "company" && (
              <div className="login-switch-row">
                <span>New to this portal?</span>
                <button
                  type="button"
                  className="login-link-btn"
                  onClick={() => handleViewChange("register")}
                >
                  Register
                </button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-form login-form-register">
            <div className="login-grid">
              <input
                type="text"
                name="first_name"
                placeholder="Recruiter first name"
                value={registerForm.first_name}
                onChange={handleRegisterInputChange}
                required
              />
              <input
                type="text"
                name="last_name"
                placeholder="Recruiter last name"
                value={registerForm.last_name}
                onChange={handleRegisterInputChange}
                required
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Work email address"
              value={registerForm.email}
              onChange={handleRegisterInputChange}
              required
            />

            <div className="login-grid">
              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={registerForm.password}
                onChange={handleRegisterInputChange}
                required
              />
              <input
                type="password"
                name="confirm_password"
                placeholder="Confirm password"
                value={registerForm.confirm_password}
                onChange={handleRegisterInputChange}
                required
              />
            </div>

            <input
              type="text"
              name="company_name"
              placeholder="Company name"
              value={registerForm.company_name}
              onChange={handleRegisterInputChange}
              required
            />

            <div className="login-grid">
              <input
                type="text"
                name="location"
                placeholder="Company location"
                value={registerForm.location}
                onChange={handleRegisterInputChange}
                required
              />
              <input
                type="text"
                name="industry"
                placeholder="Industry"
                value={registerForm.industry}
                onChange={handleRegisterInputChange}
                required
              />
            </div>

            <input
              type="url"
              name="website"
              placeholder="Company website (optional)"
              value={registerForm.website}
              onChange={handleRegisterInputChange}
            />

            <textarea
              name="description"
              placeholder="Briefly describe your company and hiring focus"
              value={registerForm.description}
              onChange={handleRegisterInputChange}
              rows="4"
              required
            />

            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? "Creating Account..." : "Create Recruiter Account"}
            </button>

            <div className="login-switch-row">
              <span>Already have an account?</span>
              <button
                type="button"
                className="login-link-btn"
                onClick={() => handleViewChange("login")}
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
