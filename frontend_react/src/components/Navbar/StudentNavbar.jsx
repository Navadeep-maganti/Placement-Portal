import { Link, NavLink } from "react-router-dom";
import "../../styles/css/StudentNavbar.css";

function StudentNavbar({ student }) {
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
        <span className="nav-username">
          Hello, {student?.first_name}
        </span>
      </div>
    </nav>
  );
}

export default StudentNavbar;
