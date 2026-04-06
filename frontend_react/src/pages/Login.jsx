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
  registration_no: "",
  department: "",
  graduation_year: "",
  cgpa: "",
  active_backlogs: "0",
  company_name: "",
  location: "",
  industry: "",
  website: "",
  description: "",
};

const extractErrorMessage = (data) => {
  if (!data) {
    return "";
  }

  if (typeof data === "string") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.find(Boolean) || "";
  }

  if (typeof data === "object") {
    if (typeof data.detail === "string") {
      return data.detail;
    }

    for (const value of Object.values(data)) {
      const message = extractErrorMessage(value);
      if (message) {
        return message;
      }
    }
  }

  return "";
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
  const [studentOtp, setStudentOtp] = useState("");
  const [studentOtpRequested, setStudentOtpRequested] = useState(false);
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
    setAuthView("login");
    setStudentOtp("");
    setStudentOtpRequested(false);
  };

  const handleViewChange = (nextView) => {
    setAuthView(nextView);
    setError("");
    setInfo("");
    setStudentOtp("");
    setStudentOtpRequested(false);
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

  const handleStudentOtpChange = (event) => {
    setStudentOtp(event.target.value);
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
      if (loginType === "student") {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/students/register/request-otp/",
          {
            first_name: registerForm.first_name.trim(),
            last_name: registerForm.last_name.trim(),
            email: registerForm.email.trim().toLowerCase(),
            password: registerForm.password,
            confirm_password: registerForm.confirm_password,
            registration_no: registerForm.registration_no.trim().toUpperCase(),
            department: registerForm.department.trim(),
            graduation_year: Number(registerForm.graduation_year),
            cgpa: Number(registerForm.cgpa),
            active_backlogs: Number(registerForm.active_backlogs || 0),
          }
        );

        setStudentOtpRequested(true);
        setInfo(
          response.data?.detail ||
            "OTP sent to your college email. Enter it below to finish registration."
        );
        return;
      }

      const response = await axios.post("http://127.0.0.1:8000/api/companies/register/", {
        ...registerForm,
        email: registerForm.email.trim(),
        website: registerForm.website.trim(),
      });

      setInfo(
        response.data?.detail ||
          "Recruiter account created successfully. Admin approval is pending."
      );
      setAuthView("login");
      setLoginForm({ email: registerForm.email.trim(), password: "" });
      setRegisterForm(emptyRegisterForm);
    } catch (err) {
      const firstError = extractErrorMessage(err.response?.data);
      if (firstError) {
        setError(firstError);
      } else if (err.message === "Network Error") {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Unable to create recruiter account right now. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStudentOtpVerification = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!studentOtpRequested) {
      setError("Request an OTP first.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/students/register/verify-otp/",
        {
          email: registerForm.email.trim().toLowerCase(),
          otp: studentOtp.trim(),
        }
      );

      setInfo(
        response.data?.detail ||
          "Student account created successfully. You can now sign in."
      );
      setAuthView("login");
      setLoginForm({ email: registerForm.email.trim().toLowerCase(), password: "" });
      setRegisterForm(emptyRegisterForm);
      setStudentOtp("");
      setStudentOtpRequested(false);
    } catch (err) {
      const firstError = extractErrorMessage(err.response?.data);
      if (firstError) {
        setError(firstError);
      } else if (err.message === "Network Error") {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Unable to verify OTP right now. Please try again.");
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
            ? authView === "register"
              ? "Student Registration"
              : "Student Login"
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

        {authView === "login" ? (
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
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-form login-form-register">
            <div className="login-grid">
              <input
                type="text"
                name="first_name"
                placeholder={loginType === "student" ? "First name" : "Recruiter first name"}
                value={registerForm.first_name}
                onChange={handleRegisterInputChange}
                required
              />
              <input
                type="text"
                name="last_name"
                placeholder={loginType === "student" ? "Last name" : "Recruiter last name"}
                value={registerForm.last_name}
                onChange={handleRegisterInputChange}
                required
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder={
                loginType === "student"
                  ? "College email address"
                  : "Work email address"
              }
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

            {loginType === "student" ? (
              <>
                <p className="login-hint">
                  Only emails ending with <strong>@student.nitandhra.ac.in</strong> are
                  allowed for student signup.
                </p>
                <input
                  type="text"
                  name="registration_no"
                  placeholder="Registration number"
                  value={registerForm.registration_no}
                  onChange={handleRegisterInputChange}
                  required
                />
                <div className="login-grid">
                  <input
                    type="text"
                    name="department"
                    placeholder="Department"
                    value={registerForm.department}
                    onChange={handleRegisterInputChange}
                    required
                  />
                  <input
                    type="number"
                    name="graduation_year"
                    placeholder="Graduation year"
                    value={registerForm.graduation_year}
                    onChange={handleRegisterInputChange}
                    min="2000"
                    max="2100"
                    required
                  />
                </div>
                <div className="login-grid">
                  <input
                    type="number"
                    name="cgpa"
                    placeholder="CGPA"
                    value={registerForm.cgpa}
                    onChange={handleRegisterInputChange}
                    min="0"
                    max="10"
                    step="0.01"
                    required
                  />
                  <input
                    type="number"
                    name="active_backlogs"
                    placeholder="Active backlogs"
                    value={registerForm.active_backlogs}
                    onChange={handleRegisterInputChange}
                    min="0"
                    required
                  />
                </div>
                {studentOtpRequested && (
                  <>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter 6-digit OTP"
                      value={studentOtp}
                      onChange={handleStudentOtpChange}
                      maxLength={6}
                      required
                    />
                    <button
                      type="button"
                      className="login-btn"
                      onClick={handleStudentOtpVerification}
                      disabled={submitting}
                    >
                      {submitting ? "Verifying..." : "Verify OTP & Create Account"}
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
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
              </>
            )}

            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting
                ? loginType === "student"
                  ? "Sending OTP..."
                  : "Creating Account..."
                : loginType === "student"
                  ? studentOtpRequested
                    ? "Resend OTP"
                    : "Send OTP"
                  : "Create Recruiter Account"}
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
