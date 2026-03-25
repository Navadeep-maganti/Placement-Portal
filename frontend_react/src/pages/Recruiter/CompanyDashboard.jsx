import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/css/CompanyDashboard.css";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import { useAuth } from "../../contexts/AuthContext";
import { FiBriefcase, FiUsers, FiUserCheck, FiCalendar } from "react-icons/fi";
import api from "../../utils/api";

function companyDashboard() {
  const { auth, loading } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({
    overview: {
      active_job_posts: 0,
      total_applicants: 0,
      shortlisted_students: 0,
      scheduled_interviews: 0,
    },
    recent_activity: [],
  });
  const [pageError, setPageError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setPageError("");
        const response = await api.get("/placements/company-dashboard/");
        setDashboard(response.data || dashboard);
      } catch (error) {
        setPageError(
          error.response?.data?.detail || "Failed to load company dashboard."
        );
      } finally {
        setPageLoading(false);
      }
    };

    if (!loading && auth.user) {
      fetchDashboard();
    } else if (!loading) {
      setPageLoading(false);
    }
  }, [loading, auth.user]);

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Just now";

    const date = new Date(timestamp);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  };

  if (loading || pageLoading) return <p>Loading...</p>;
  if (!auth.user) return <p>No user data</p>;
  return (
    <>
      <CompanyNavbar Company={auth.user} />
      <div className="Company-Dashboard-body">

        <section className="cd-hero">
          <div className="cd-hero-text">
            <h2>Welcome, {auth.user.first_name}! &#128075;</h2>
            <p className="cd-subtitle">
              Here's what's happening with your recruitment cycle today.
            </p>
            {pageError && <p className="cd-subtitle">{pageError}</p>}
          </div>
          <div className="cd-posting">
            <button
              className="cd-btn"
              onClick={() => navigate("/Recruiter/MyPostings")}
            >
              + post new job
            </button>
          </div>

        </section>

        <section className="cd-main-div">
          <div className="cd-section-header">
            <h3>Placement Overview</h3>
            <span className="cd-section-tag">This month</span>
          </div>
          <div className="cd-overview-div">
            <div className="cd-overview-card cd-active-job-posts">
              <div className="cd-overview-head">
                <span className="cd-overview-icon">
                  <FiBriefcase size={18} />
                </span>
                <h4 className="cd-overview-title">Active Job Posts</h4>
              </div>

              <p className="cd-overview-count">
                {dashboard.overview.active_job_posts}
              </p>
            </div>
            <div className="cd-overview-card cd-total-applicants">
              <div className="cd-overview-head">
                <span className="cd-overview-icon">
                  <FiUsers size={18} />
                </span>
                <h4 className="cd-overview-title">Total Applicants</h4>
              </div>
              <p className="cd-overview-count">
                {dashboard.overview.total_applicants}
              </p>
            </div>
            <div className="cd-overview-card cd-shortlisted-students">
              <div className="cd-overview-head">
                <span className="cd-overview-icon">
                  <FiUserCheck size={18} />
                </span>
                <h4 className="cd-overview-title">Shortlisted Students</h4>
              </div>
              <p className="cd-overview-count">
                {dashboard.overview.shortlisted_students}
              </p>
            </div>
            <div className="cd-overview-card cd-scheduled-interviews">
              <div className="cd-overview-head">
                <span className="cd-overview-icon">
                  <FiCalendar size={18} />
                </span>
                <h4 className="cd-overview-title">Scheduled Interviews</h4>
              </div>
              <p className="cd-overview-count">
                {dashboard.overview.scheduled_interviews}
              </p>
            </div>
          </div>
        </section>

        <section className="cd-recent-activity">
          <div className="cd-section-header">
            <h3>Recent Activity</h3>
            <button
              className="cd-btn"
              onClick={() => navigate("/Recruiter/ViewApplicants")}
            >
              View all applicants
            </button>
          </div>
          <div className="cd-activity-feed">
            {dashboard.recent_activity.length > 0 ? (
              dashboard.recent_activity.map((activity) => (
                <div key={activity.id} className="cd-activity-item">
                  <p>{activity.description}</p>
                  <div className="cd-view-applicant">
                    <span className="cd-activity-time">
                      {formatRelativeTime(activity.created_at)}
                    </span>
                    <button
                      className="cd-view-profile"
                      onClick={() => navigate("/Recruiter/ViewApplicants")}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="cd-activity-item">
                <p>No recent activity yet. New applications and status changes will appear here.</p>
                <div className="cd-view-applicant">
                  <span className="cd-activity-time">Waiting for updates</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="cd-footer">
          <p>@2026 Placement Portal NIT AP. All rights reserved.</p>
        </footer>

      </div>
    </>
  );
}
export default companyDashboard;
