import { Link, Navigate, NavLink } from "react-router-dom";
import "../../styles/css/StudentNavbar.css";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
function StudentNavbar({ student }) {
  const { logout } = useAuth();
  return (
    <nav className="student-navbar">
      {/* LEFT */}
      <div className="left-nav nav-surface">
        <Link to="/student/dashboard" className="nav-title">
          Placement Portal
          <br />
          <span className="nav-subtitle">NIT AP</span>
        </Link>
      </div>

      {/* CENTER */}
      <div className="center-nav nav-surface">
        <NavLink
          to="/student/jobs"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          All Jobs
        </NavLink>

        <NavLink
          to="/student/applications"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          My Applications
        </NavLink>

        <NavLink
          to="/student/bookmarks"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          My Bookmarks
        </NavLink>
      </div>

      {/* RIGHT */}
      <div className="right-nav nav-surface">
        <Link to="/student/profile" className="profile">
          <FaUserCircle size={26} />
          <span className="profile-name">{student?.first_name}</span>
        </Link>
        <button
          onClick={logout}
          className="logout-button"
          title="Logout"
        >
          <FiLogOut size={20} />
        </button>

      </div>
    </nav>
  );
}

export default StudentNavbar;
