import { Link } from "react-router-dom";
import "../../styles/css/StudentFooter.css";

function StudentFooter() {
  return (
    <footer className="student-footer">
      <div className="sf-inner">
        <div className="sf-brand">
          <div className="sf-title">Placement Portal</div>
          <p className="sf-tagline">
            Built for students to navigate opportunities with clarity and
            confidence.
          </p>
        </div>

        <div className="sf-links">
          <h4>Student</h4>
          <Link to="/student/jobs">All Jobs</Link>
          <Link to="/student/applications">My Applications</Link>
          <Link to="/student/bookmarks">Bookmarks</Link>
          <Link to="/student/profile">Profile</Link>
        </div>

        <div className="sf-links">
          <h4>Resources</h4>
          <Link to="/student/prep">Interview Prep</Link>
          <Link to="/student/workshops">Workshops</Link>
          <Link to="/student/hackathons">Hackathons</Link>
          <Link to="/student/mentors">Mentors</Link>
        </div>

        <div className="sf-contact">
          <h4>Contact</h4>
          <p>placementcell@nitap.edu.in</p>
          <p>+91 88888 88888</p>
          <p>Academic Block, NIT AP</p>
        </div>
      </div>

      <div className="sf-bottom">
        <span>© 2026 NIT AP Placement Portal</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
}

export default StudentFooter;
