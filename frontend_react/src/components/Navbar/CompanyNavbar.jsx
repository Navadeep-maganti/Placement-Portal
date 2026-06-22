import { Link, NavLink } from "react-router-dom";
import "../../styles/css/CompanyNavbar.css";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
function CompanyNavbar({ Company }) {
  const { logout } = useAuth();
  return (
    <nav className="cn-Company-navbar">
      {/* LEFT */}
      <div className="cn-left-nav cn-nav-surface">
        <Link to="/company/dashboard" className="cn-nav-title">
          Placement Portal
          <br />
          <span className="cn-nav-subtitle">NIT AP</span>
        </Link>
      </div>

      {/* CENTER */}
      <div className="cn-center-nav cn-nav-surface">
        <NavLink
          to="/Recruiter/MyPostings"
          className={({ isActive }) =>
            isActive ? "cn-nav-link active" : "cn-nav-link"
          }
        >
          Job Listings
        </NavLink>

        <NavLink
          to="/Recruiter/Manage"
          className={({ isActive }) =>
            isActive ? "cn-nav-link active" : "cn-nav-link"
          }
        >
          Opening Management
        </NavLink>

        <NavLink
          to="/Recruiter/ViewApplicants"
          className={({ isActive }) =>
            isActive ? "cn-nav-link active" : "cn-nav-link"
          }
        >
          Applicant Review
        </NavLink>
      </div>

      {/* RIGHT */}
      <div className="cn-right-nav cn-nav-surface">
        <Link to="/company/profile" className="cn-profile">
          <FaUserCircle size={26} />
          <span className="cn-profile-name">
            {Company?.company_name || Company?.first_name}
          </span>
        </Link>
        <button
          onClick={logout}
          className="cn-logout-button"
          title="Logout"
        >
          <FiLogOut size={20} />
        </button>

      </div>
    </nav>
  );
}

export default CompanyNavbar;
