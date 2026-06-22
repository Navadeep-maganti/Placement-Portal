import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/css/Manage.css";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import RecruiterFooter from "../../components/Footer/RecruiterFooter";
import RecruiterApprovalPending from "../../components/Recruiter/RecruiterApprovalPending";
import PageLoader from "../../components/Common/PageLoader";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";

function Manage() {
  const { auth, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isApproved = Boolean(auth.user?.is_approved);
  const [postings, setPostings] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchManageData = async () => {
      try {
        setError("");
        const response = await api.get("/placements/my-postings/");
        setPostings(response.data || []);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.error ||
            "Failed to load posting management data."
        );
      } finally {
        setPageLoading(false);
      }
    };

    if (!loading && auth.user && isApproved) {
      fetchManageData();
    } else if (!loading) {
      setPageLoading(false);
    }
  }, [loading, auth.user, isApproved]);

  useEffect(() => {
    if (location.state?.message) {
      setFeedback(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const postingStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: postings.length,
      active: postings.filter(
        (posting) => posting.is_active && posting.application_deadline >= today
      ).length,
      completed: postings.filter(
        (posting) => !posting.is_active || posting.application_deadline < today
      ).length,
      totalPositions: postings.reduce(
        (total, posting) => total + (posting.no_of_positions || 0),
        0
      ),
    };
  }, [postings]);

  if (loading || pageLoading) return <PageLoader />;
  if (!auth.user) return <p>User information is unavailable.</p>;
  if (!isApproved) {
    return (
      <>
        <CompanyNavbar Company={auth.user} />
        <RecruiterApprovalPending
          title="Opening Management Unavailable"
          message="Your recruiter profile is currently under administrative review. Opening management features will become available after your account has been approved."
        />
      </>
    );
  }

  return (
    <>
      <CompanyNavbar Company={auth.user} />
      <div className="mg-page">
        <main className="mg-container">
          <section className="mg-hero">
            <div>
              <h1>Opening Management</h1>
              <p>
                Review the roles your organization has published, identify active openings, and access editing tools whenever updates are required.
              </p>
              {error && <p className="mg-inline-message mg-error">{error}</p>}
              {feedback && <p className="mg-inline-message mg-success">{feedback}</p>}
            </div>
            <div className="mg-job-actions">
              <button
                className="mg-secondary-btn"
                onClick={() => navigate("/Recruiter/ViewApplicants")}
              >
                Applicant Review
              </button>
              <button
                className="mg-primary-btn"
                onClick={() => navigate("/Recruiter/MyPostings")}
              >
                Create Listing
              </button>
            </div>
          </section>

          <section className="mg-stats-grid">
            <div className="mg-stat-card">
              <span className="mg-stat-label">Total Listings</span>
              <strong>{postingStats.total}</strong>
            </div>
            <div className="mg-stat-card">
              <span className="mg-stat-label">Active</span>
              <strong>{postingStats.active}</strong>
            </div>
            <div className="mg-stat-card">
              <span className="mg-stat-label">Completed</span>
              <strong>{postingStats.completed}</strong>
            </div>
            <div className="mg-stat-card">
              <span className="mg-stat-label">Open Positions</span>
              <strong>{postingStats.totalPositions}</strong>
            </div>
          </section>

          <section className="mg-jobs-panel">
            <div className="mg-panel-header">
              <div>
                <h2>Published Job Listings</h2>
                <p>
                  Each card presents the role, application deadline, compensation package, and direct access for updating the listing.
                </p>
              </div>
            </div>

            <div className="mg-job-list">
              {postings.length > 0 ? (
                postings.map((posting) => (
                  <article key={posting.id} className="mg-job-card">
                    <div className="mg-job-head">
                      <div>
                        <h3>{posting.job_title}</h3>
                        <p>
                          Deadline {new Date(posting.application_deadline).toLocaleDateString()} {" • "}
                          {posting.no_of_positions} positions
                        </p>
                      </div>
                      <span
                        className={`mg-job-status ${
                          posting.is_active ? "active" : "completed"
                        }`}
                      >
                        {posting.is_active ? "Active" : "Completed"}
                      </span>
                    </div>

                    <div className="mg-job-metrics">
                      <span>{posting.job_type || "Role type not set"}</span>
                      <span>{posting.location || "Location not set"}</span>
                      <span>{posting.salary_package || "Package not set"}</span>
                      <span>{posting.experience_required || "Entry-level candidates eligible"}</span>
                    </div>

                    <div className="mg-job-actions">
                      <button
                        className="mg-secondary-btn"
                        onClick={() =>
                          navigate("/Recruiter/MyPostings", {
                            state: { editPosting: posting },
                          })
                        }
                      >
                        Edit Listing
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="mg-empty">
                  <h2>No job listings available</h2>
                  <p>
                    Create a job listing to make your organization&apos;s opportunities available here for review and editing.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
      <RecruiterFooter />
    </>
  );
}

export default Manage;

