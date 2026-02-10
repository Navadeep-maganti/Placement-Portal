import { Link } from "react-router-dom";
import "../../styles/css/LandingFooter.css";

function LandingFooter() {
  return (
    <footer className="landing-footer" id="contact">
      <div className="lf-inner">
        <div className="lf-brand">
          <div className="lf-title">Placement Portal</div>
          <p className="lf-tagline">
            Your single destination for placements, internships, and career
            growth at NIT AP.
          </p>
        </div>

        <div className="lf-links">
          <h4>Explore</h4>
          <Link to="/login">Student Login</Link>
          <Link to="/login?type=company">Recruiter Login</Link>
          <Link to="/login">Dashboard Preview</Link>
        </div>

        <div className="lf-links">
          <h4>Resources</h4>
          <a href="#PlacementStats">Outcomes</a>
          <a href="#recruitment">Process</a>
          <a href="#PlacementStats">Placement Stats</a>
        </div>

        <div className="lf-contact">
          <h4>Contact</h4>
          <p>placementcell@nitap.edu.in</p>
          <p>+91 88888 88888</p>
          <p>Academic Block, NIT AP</p>
        </div>
      </div>

      <div className="lf-bottom">
        <span>© 2026 NIT AP Placement Portal</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
}

export default LandingFooter;
