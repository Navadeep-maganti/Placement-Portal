import { useAuth } from "../../contexts/AuthContext";
import LandingNavbar from "../../components/Navbar/LandingNavbar";
import LandingFooter from "../../components/Footer/LandingFooter";
import "../../styles/css/LandingPage.css";
import { Link } from "react-router-dom";

function LandingPage() {
  const { loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <LandingNavbar />

      <div className="landing-page-body">
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>Welcome to the NIT AP Placement Portal</h1>
            <p>Your gateway to exciting career opportunities.</p>
            <Link to="/login" className="hero-btn">
              Get Started
            </Link>
          </div>
        </section>

        {/* PLACEMENT STATISTICS SECTION */}
        <section className="stats-section" id="PlacementStats">
          <h2>Previous Year Placement Statistics</h2>
          <p className="stats-subtitle">
            Highlights of our placement performance for the last academic year
          </p>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>820+</h3>
              <p>Students Placed</p>
            </div>

            <div className="stat-card">
              <h3>92%</h3>
              <p>Placement Percentage</p>
            </div>

            <div className="stat-card">
              <h3>₹45 LPA</h3>
              <p>Highest Package</p>
            </div>

            <div className="stat-card">
              <h3>₹7.5 LPA</h3>
              <p>Average Package</p>
            </div>

            <div className="stat-card">
              <h3>150+</h3>
              <p>Companies Visited</p>
            </div>
          </div>
        </section>

        {/* RECRUITMENT PROCESS SECTION */}
        <section className="recruitment-section" id="recruitment">
          <h2>Recruitment Process</h2>
          <p className="recruitment-subtitle">
            A structured and transparent process followed for campus placements
          </p>

          <div className="recruitment-steps">
            <div className="recruitment-card">
              <span>1</span>
              <h3>Company Registration</h3>
              <p>
                Recruiters register on the Placement Portal and submit company details
                for verification by the placement cell.
              </p>
            </div>

            <div className="recruitment-card">
              <span>2</span>
              <h3>Job Posting</h3>
              <p>
                Approved companies post job roles along with eligibility criteria,
                job descriptions, and application deadlines.
              </p>
            </div>

            <div className="recruitment-card">
              <span>3</span>
              <h3>Student Applications</h3>
              <p>
                Eligible students view opportunities and apply through a single
                centralized platform.
              </p>
            </div>

            <div className="recruitment-card">
              <span>4</span>
              <h3>Shortlisting</h3>
              <p>
                Recruiters review applications and shortlist candidates based on
                eligibility and requirements.
              </p>
            </div>

            <div className="recruitment-card">
              <span>5</span>
              <h3>Interviews & Tests</h3>
              <p>
                Shortlisted students attend online tests, technical interviews,
                and HR rounds as scheduled by the recruiter.
              </p>
            </div>

            <div className="recruitment-card">
              <span>6</span>
              <h3>Offer & Acceptance</h3>
              <p>
                Selected students receive offers through the portal and can accept
                or decline as per placement rules.
              </p>
            </div>
          </div>
        </section>

      </div>

      <LandingFooter />
    </>
  );
}

export default LandingPage;
