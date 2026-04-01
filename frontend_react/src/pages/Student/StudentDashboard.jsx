import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StudentNavbar from "../../components/Navbar/StudentNavbar";
import StudentFooter from "../../components/Footer/StudentFooter";
import PageLoader from "../../components/Common/PageLoader";
import RecruiterToast from "../../components/Recruiter/RecruiterToast";
import { useAuth } from "../../contexts/AuthContext";
import useRecruiterToast from "../../hooks/useRecruiterToast";
import "../../styles/css/StudentDashboard.css";
import api from "../../utils/api";

const formatStatus = (status) =>
  status
    ? status
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "Applied";

function StudentDashboard() {
  const { auth, loading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [jobs, setJobs] = useState([]);
  const { toast, showToast } = useRecruiterToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError("");
        const [bookmarksRes, applicationsRes, jobsRes] = await Promise.all([
          api.get("/bookmarks/"),
          api.get("/applications/myapplications/"),
          api.get("/placements/allplacements/"),
        ]);
        setBookmarks(bookmarksRes.data || []);
        setApplications(applicationsRes.data || []);
        setJobs(jobsRes.data || []);
      } catch (err) {
        const message =
          err.response?.data?.detail ||
          "Failed to load dashboard data. Please refresh and try again.";
        setError(message);
        showToast(message, "error");
      } finally {
        setPageLoading(false);
      }
    };

    if (!loading && auth.user) {
      fetchDashboardData();
    } else if (!loading) {
      setPageLoading(false);
    }
  }, [loading, auth.user]);

  const profileCompletion = useMemo(() => {
    if (!auth.user) {
      return 0;
    }

    const checks = [
      auth.user.first_name,
      auth.user.last_name,
      auth.user.email,
      auth.user.phone,
      auth.user.department,
      auth.user.cgpa,
      auth.user.linkedin_url,
      auth.user.skills_summary,
      auth.user.bio,
      auth.user.resume,
    ];
    return Math.round(
      (checks.filter((value) => `${value || ""}`.trim()).length / checks.length) *
        100
    );
  }, [auth.user]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort(
        (a, b) => new Date(b.application_date) - new Date(a.application_date)
      )
      .slice(0, 4);
  }, [applications]);

  const offeredApplications = applications.filter((app) =>
    ["offered", "offer_accepted", "offer_declined"].includes(app.status)
  );
  const acceptedOffer = applications.find((app) => app.status === "offer_accepted");

  const recentWeekCount = applications.filter((app) => {
    const appliedAt = new Date(app.application_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return appliedAt >= weekAgo;
  }).length;

  if (loading || pageLoading) return <PageLoader />;
  if (!auth.user) return <p>No user data</p>;

  return (
    <>
      <RecruiterToast toast={toast} />
      <StudentNavbar student={auth.user} />
      <div className="student-dashboard-body">
        <section className="sd-hero">
          <div className="sd-hero-text">
            <div className="sd-eyebrow">Student Hub</div>
            <h2>Welcome, {auth.user.first_name}! </h2>
            <p className="sd-subtitle">
              Track your applications, keep your resume ready, and stay on top
              of offer decisions from one place.
            </p>
            <div className="sd-hero-actions">
              <Link to="/student/jobs" className="sd-btn primary">
                Explore Opportunities
              </Link>
              <Link to="/student/profile" className="sd-btn ghost">
                Update Profile
              </Link>
            </div>
          </div>

          <div className="current-drive">
            <div className="live-drive">
              <span aria-hidden="true" />
              PROFILE READY
            </div>
            <div className="drive-details">
              <h3>{profileCompletion}% complete</h3>
              <p>
                {auth.user.resume
                  ? "Your resume is uploaded and available for resume-required jobs."
                  : "Upload your resume to unlock resume-required applications."}
              </p>
              <div className="drive-meta">
                <span>{jobs.filter((job) => job.is_active).length} active jobs</span>
                <span>{bookmarks.length} saved roles</span>
                <span>{offeredApplications.length} offer updates</span>
              </div>
            </div>
          </div>
        </section>

        <section className="sd-main-div">
          <div className="sd-section-header">
            <h3>Placement Overview</h3>
            <span className="sd-section-tag">Live data</span>
          </div>
          {error && <p>{error}</p>}
          {acceptedOffer && (
            <div className="sd-lock-banner">
              <strong>Offer accepted:</strong> You have accepted the offer from{" "}
              {acceptedOffer.company_name}. Other active applications are closed
              automatically.
            </div>
          )}
          <div className="overview-div">
            <Link
              className="overview-card overview-card-link appliedRoles"
              to="/student/applications"
            >
              <h4 className="overview-title">Applied Roles</h4>
              <p className="overview-count">{applications.length}</p>
              <p className="overview-footnote">
                {recentWeekCount} new since last week
              </p>
            </Link>
            <Link
              className="overview-card overview-card-link bookmarkedRoles"
              to="/student/bookmarks"
            >
              <h4 className="overview-title">Bookmarked Roles</h4>
              <p className="overview-count">{bookmarks.length}</p>
              <p className="overview-footnote">Shortlist to stay focused</p>
            </Link>
            <Link
              className="overview-card overview-card-link shortlisted"
              to="/student/applications?status=shortlisted"
            >
              <h4 className="overview-title">Shortlisted</h4>
              <p className="overview-count">
                {applications.filter((app) => app.status === "shortlisted").length}
              </p>
              <div className="shortlist-comment">
                <span className="dot" aria-hidden="true" />
                Recruiter activity
              </div>
            </Link>
            <Link
              className="overview-card overview-card-link offersRecieved"
              to="/student/applications?status=offers"
            >
              <h4 className="overview-title">Offers Received</h4>
              <p className="overview-count">{offeredApplications.length}</p>
              <div className="congratulations">
                <span className="check-badge" aria-hidden="true">
                  OK
                </span>
                Review decisions
              </div>
            </Link>
          </div>
        </section>

        <section className="sd-main-div">
          <div className="sd-section-header">
            <h3>Recent Application Activity</h3>
            <Link to="/student/applications" className="sd-section-link">
              Open tracker
            </Link>
          </div>

          <div className="sd-activity-grid">
            {recentApplications.length > 0 ? (
              recentApplications.map((application) => (
                <div key={application.id} className="sd-activity-card">
                  <div className="sd-activity-top">
                    <div>
                      <h4>{application.job_title}</h4>
                      <p>{application.company_name}</p>
                    </div>
                    <span className={`sd-status-chip ${application.status}`}>
                      {formatStatus(application.status)}
                    </span>
                  </div>
                  <div className="sd-activity-meta">
                    <span>{application.company_location || "Location pending"}</span>
                    <span>{application.salary_lpa || "Salary pending"}</span>
                    <span>
                      {new Date(application.application_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="sd-activity-remark">
                    {application.status_history?.[0]?.remarks ||
                      "Application submitted successfully."}
                  </p>
                </div>
              ))
            ) : (
              <div className="sd-empty-card">
                <p>No applications yet. Start exploring jobs to build your tracker.</p>
              </div>
            )}
          </div>
        </section>

        <section className="sd-categories">
          <div className="sd-section-header">
            <h3>Quick Routes</h3>
            <span className="sd-section-tag">Student module</span>
          </div>
          <div className="category-grid">
            <Link className="category-card" to="/student/profile">
              Profile management
            </Link>
            <Link className="category-card" to="/student/jobs">
              Job discovery
            </Link>
            <Link className="category-card" to="/student/applications">
              Application tracking
            </Link>
            <Link className="category-card" to="/student/mentors">
              Mentor connect
            </Link>
            <Link className="category-card" to="/student/workshops">
              Workshop calendar
            </Link>
            <Link className="category-card" to="/student/hackathons">
              Hackathon board
            </Link>
            <Link className="category-card" to="/student/bookmarks">
              Saved opportunities
            </Link>
          </div>
        </section>
        <StudentFooter />
      </div>
    </>
  );
}

export default StudentDashboard;
