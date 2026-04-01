import { useAuth } from "../../contexts/AuthContext";
import LandingNavbar from "../../components/Navbar/LandingNavbar";
import LandingFooter from "../../components/Footer/LandingFooter";
import PageLoader from "../../components/Common/PageLoader";
import "../../styles/css/LandingPage.css";
import { Link } from "react-router-dom";

function LandingPage() {
  const { loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <>
      <LandingNavbar />

      <div className="landing-page-body">
        <section className="lp-hero">
          <div className="lp-hero-text">
            <div className="lp-pill">NIT AP Placement Cell</div>
            <h1>Build your career pathway with clarity and confidence.</h1>
            <p>
              From applications to offers, the portal keeps every placement
              milestone in one modern workspace.
            </p>
            <div className="lp-hero-actions">
              <Link to="/login" className="lp-btn primary">
                Get Started
              </Link>
              <a
                href="#PlacementStats"
                className="lp-btn ghost"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("PlacementStats")
                    .scrollIntoView({ behavior: "smooth" });
                }}
              >
                View Outcomes
              </a>
            </div>
            <div className="lp-hero-meta">
              <span>150+ recruiters</span>
              <span>92% placements</span>
              <span>Career support year-round</span>
            </div>
          </div>

          <div className="lp-hero-card">
            <div className="lp-card-header">
              <span className="lp-status-dot" />
              Live season updates
            </div>
            <h3>Placement Drive 2025-26</h3>
            <p>
              Track deadlines, shortlists, and interview schedules in a single
              dashboard.
            </p>
            <div className="lp-card-grid">
              <div>
                <h4>30+</h4>
                <p>Upcoming drives</p>
              </div>
              <div>
                <h4>110</h4>
                <p>Active roles</p>
              </div>
              <div>
                <h4>24</h4>
                <p>Interview slots</p>
              </div>
              <div>
                <h4>8</h4>
                <p>Offer calls</p>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-section" id="PlacementStats">
          <div className="lp-section-head">
            <h2>Placement outcomes at a glance</h2>
            <p>
              A snapshot of the previous academic year to keep the mission
              transparent and inspiring.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>820+</h3>
              <p>Students placed</p>
            </div>

            <div className="stat-card">
              <h3>92%</h3>
              <p>Placement rate</p>
            </div>

            <div className="stat-card">
              <h3>INR 45 LPA</h3>
              <p>Highest package</p>
            </div>

            <div className="stat-card">
              <h3>INR 7.5 LPA</h3>
              <p>Average package</p>
            </div>

            <div className="stat-card">
              <h3>150+</h3>
              <p>Companies visited</p>
            </div>
          </div>
        </section>

        <section className="lp-features">
          <div className="lp-section-head">
            <h2>Everything students need to stay ahead</h2>
            <p>One workspace for applications, interviews, and support.</p>
          </div>
          <div className="lp-feature-grid">
            <div className="lp-feature-card">
              <h4>Application Tracker</h4>
              <p>Monitor each role status with real-time updates.</p>
            </div>
            <div className="lp-feature-card">
              <h4>Interview Prep Hub</h4>
              <p>Access practice prompts, mock slots, and guidance.</p>
            </div>
            <div className="lp-feature-card">
              <h4>Eligibility Signals</h4>
              <p>Instant checks for CGPA, skills, and department.</p>
            </div>
            <div className="lp-feature-card">
              <h4>Offer Management</h4>
              <p>Track offers, deadlines, and acceptance decisions.</p>
            </div>
          </div>
        </section>

        <section className="recruitment-section" id="recruitment">
          <div className="lp-section-head">
            <h2>Recruitment process</h2>
            <p>
              A structured journey that keeps students, recruiters, and the
              placement cell aligned.
            </p>
          </div>

          <div className="recruitment-steps">
            <div className="recruitment-card">
              <span>1</span>
              <h3>Company registration</h3>
              <p>Recruiters submit details for placement cell verification.</p>
            </div>

            <div className="recruitment-card">
              <span>2</span>
              <h3>Role publishing</h3>
              <p>Job roles, criteria, and timelines go live on the portal.</p>
            </div>

            <div className="recruitment-card">
              <span>3</span>
              <h3>Student applications</h3>
              <p>Eligible students apply and track progress instantly.</p>
            </div>

            <div className="recruitment-card">
              <span>4</span>
              <h3>Shortlisting</h3>
              <p>Recruiters review profiles and shortlist candidates.</p>
            </div>

            <div className="recruitment-card">
              <span>5</span>
              <h3>Interviews & tests</h3>
              <p>Technical rounds and HR discussions happen on schedule.</p>
            </div>

            <div className="recruitment-card">
              <span>6</span>
              <h3>Offer decisions</h3>
              <p>Offers are released through the portal for acceptance.</p>
            </div>
          </div>
        </section>

        <section className="lp-cta">
          <div className="lp-cta-card">
            <div>
              <h2>Ready to explore new opportunities?</h2>
              <p>
                Sign in to access your dashboard, updates, and curated roles.
              </p>
            </div>
            <Link to="/login" className="lp-btn primary">
              Login to Portal
            </Link>
          </div>
        </section>
      </div>

      <LandingFooter />
    </>
  );
}

export default LandingPage;
