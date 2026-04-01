import { Link } from "react-router-dom";
import "../../styles/css/RecruiterFooter.css";

function RecruiterFooter() {
  return (
    <footer className="recruiter-footer">
      <div className="rf-inner">
        <div className="rf-brand">
          <div className="rf-kicker">Recruiter Workspace</div>
          <div className="rf-title">Placement Portal</div>
          <p className="rf-tagline">
            Built for recruiters to manage opportunities, review applicants,
            and coordinate campus hiring with confidence.
          </p>
        </div>

        <div className="rf-links">
          <h4>Recruiter</h4>
          <Link to="/company/dashboard">Dashboard</Link>
          <Link to="/Recruiter/MyPostings">Job Listings</Link>
          <Link to="/Recruiter/Manage">Opening Management</Link>
          <Link to="/Recruiter/ViewApplicants">Applicant Review</Link>
        </div>

        <div className="rf-contact">
          <h4>Contact</h4>
          <p>placementcell@nitap.edu.in</p>
          <p>+91 88888 88888</p>
          <p>Academic Block, NIT AP</p>
        </div>
      </div>

      <div className="rf-bottom">
        <span>&copy; 2026 NIT AP Placement Portal</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
}

export default RecruiterFooter;
