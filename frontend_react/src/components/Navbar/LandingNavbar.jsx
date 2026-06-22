import { Link } from "react-router-dom";
import "../../styles/css/LandingNavbar.css";

function LandingNavbar() {
  return (
    <nav className="landing-navbar">
      <div className="left-nav">
        <Link to="/" className="nav-title">
          Placement Portal
          <br />
          <span className="nav-subtitle">NIT AP</span>
        </Link>
      </div>

      <div className="center-nav">
        <Link
          to="/landingPage#PlacementStats"
          className="landing-link"
          onClick={(e) => {
            e.preventDefault();
            document
              .getElementById("PlacementStats")
              .scrollIntoView({ behavior: "smooth" });
          }}
        >
          Outcomes
        </Link>
        <Link
          to="/landingPage#recruitment"
          className="landing-link"
          onClick={(e) => {
            e.preventDefault();
            document
              .getElementById("recruitment")
              .scrollIntoView({ behavior: "smooth" });
          }}
        >
          Process
        </Link>
        <a
          href="#contact"
          className="landing-link"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("contact").scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          Contact
        </a>
      </div>

      <div className="right-nav">
        <Link to="/login" className="landing-loginBtn">
          Login
        </Link>
      </div>
    </nav>
  );
}

export default LandingNavbar;
