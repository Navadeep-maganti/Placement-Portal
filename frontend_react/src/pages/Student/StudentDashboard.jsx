import StudentNavbar from "../../components/Navbar/StudentNavbar";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/css/StudentDashboard.css";
import StudentFooter from "../../components/Footer/StudentFooter";
function StudentDashboard() {
  const { auth, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!auth.user) return <p>No user data</p>;

  return (
    <>
      <StudentNavbar student={auth.user} />
      <div className="student-dashboard-body">
        <section className="sd-hero">
          <div className="sd-hero-text">
            <div className="sd-eyebrow">Student Hub</div>
            <h2>Welcome, {auth.user.first_name}! &#128075;</h2>
            <p className="sd-subtitle">
              Track applications, prepare for interviews, and discover roles
              tailored to your journey.
            </p>
            <div className="sd-hero-actions">
              <button className="sd-btn primary">Explore Opportunities</button>
              <button className="sd-btn ghost">Update Profile</button>
            </div>
          </div>

          <div className="current-drive">
            <div className="live-drive">
              <span aria-hidden="true" />
              LIVE DRIVE
            </div>
            <div className="drive-details">
              <h3>Placement Drive 2025 - 26</h3>
              <p>Unlock your potential with our latest placement drive.</p>
              <div className="drive-meta">
                <span>30+ companies</span>
                <span>Hybrid interviews</span>
                <span>Starts this week</span>
              </div>
            </div>
          </div>
        </section>

        <section className="sd-main-div">
          <div className="sd-section-header">
            <h3>Placement Overview</h3>
            <span className="sd-section-tag">This month</span>
          </div>
          <div className="overview-div">
            <div className="overview-card appliedRoles">
              <h4 className="overview-title">Applied Roles</h4>
              <p className="overview-count">5</p>
              <p className="overview-footnote">2 new since last week</p>
            </div>
            <div className="overview-card bookmarkedRoles">
              <h4 className="overview-title">Bookmarked Roles</h4>
              <p className="overview-count">3</p>
              <p className="overview-footnote">Shortlist to stay focused</p>
            </div>
            <div className="overview-card shortlisted">
              <h4 className="overview-title">Shortlisted</h4>
              <p className="overview-count">2</p>
              <div className="shortlist-comment">
                <span className="dot" aria-hidden="true" />
                Interviews scheduled
              </div>
            </div>
            <div className="overview-card offersRecieved">
              <h4 className="overview-title">Offers Received</h4>
              <p className="overview-count">1</p>
              <div className="congratulations">
                <span className="check-badge" aria-hidden="true">
                  OK
                </span>
                Congratulations!
              </div>
            </div>
          </div>
        </section>

        <section className="sd-categories">
          <div className="sd-section-header">
            <h3>Explore Categories</h3>
            <span className="sd-section-tag">Customize anytime</span>
          </div>
          <div className="category-grid">
            <div className="category-card">Software Engineering</div>
            <div className="category-card">Data & Analytics</div>
            <div className="category-card">Product & Design</div>
            <div className="category-card">Core Engineering</div>
            <div className="category-card">Finance & Consulting</div>
            <div className="category-card">Operations & Supply</div>
            <div className="category-card">Research & Innovation</div>
            <div className="category-card">Internships</div>
            <div className="category-card">Hackathons</div>
            <div className="category-card">Workshops</div>
            <div className="category-card">Alumni Connect</div>
            <div className="category-card">Interview Prep</div>
          </div>
        </section>
        <StudentFooter />
      </div>
    </>
  );
}

export default StudentDashboard;
