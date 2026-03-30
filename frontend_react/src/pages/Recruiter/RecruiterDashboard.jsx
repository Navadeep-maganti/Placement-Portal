import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/css/CompanyDashboard.css";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import ApplicantProfileModal from "../../components/Recruiter/ApplicantProfileModal";
import { useAuth } from "../../contexts/AuthContext";
import { FiBriefcase, FiUsers, FiUserCheck, FiCalendar } from "react-icons/fi";
import api from "../../utils/api";

function RecruiterDashboard() {
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
  const [applications, setApplications] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [modalError, setModalError] = useState("");
  const [pageError, setPageError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setPageError("");
        const [dashboardResponse, applicantsResponse, statusesResponse] = await Promise.all([
          api.get("/placements/company-dashboard/"),
          api.get("/applications/company-applicants/"),
          api.get("/applications/statuses/"),
        ]);
        setDashboard(dashboardResponse.data || dashboard);
        setApplications(applicantsResponse.data || []);
        setStatuses(statusesResponse.data || []);
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

  const applicationById = useMemo(
    () => new Map(applications.map((application) => [application.id, application])),
    [applications]
  );

  const handleStatusUpdate = async ({ applicationId, statusId, remarks }) => {
    if (!statusId) {
      setModalError("Please choose a new status before updating.");
      return;
    }

    try {
      setSavingId(applicationId);
      setModalError("");
      const response = await api.patch(`/applications/${applicationId}/status/`, {
        status_id: Number(statusId),
        remarks,
      });
      const updated = response.data;
      setApplications((prev) =>
        prev.map((application) =>
          application.id === applicationId ? updated : application
        )
      );
      setSelectedApplication(updated);
    } catch (error) {
      setModalError(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Failed to update application status."
      );
    } finally {
      setSavingId(null);
    }
  };

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

  if (loading || pageLoading) return <p>Loading dashboard...</p>;
  if (!auth.user) return <p>User information is unavailable.</p>;

  return (
    <>
      <CompanyNavbar Company={auth.user} />
      <div className="Company-Dashboard-body">
        <section className="cd-hero">
          <div className="cd-hero-text">
            <h2>Welcome, {auth.user.first_name}.</h2>
            <p className="cd-subtitle">
              Review the current status of your recruitment activity.
            </p>
            {pageError && <p className="cd-subtitle">{pageError}</p>}
          </div>
          <div className="cd-posting">
            <button
              className="cd-btn"
              onClick={() => navigate("/Recruiter/MyPostings")}
            >
              Create Job Posting
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
                <h4 className="cd-overview-title">Active Job Openings</h4>
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
              Review All Applicants
            </button>
          </div>
          <div className="cd-activity-feed">
            {dashboard.recent_activity.length > 0 ? (
              dashboard.recent_activity.map((activity) => {
                const application = applicationById.get(activity.application_id);
                return (
                  <div key={activity.id} className="cd-activity-item">
                    <p>{activity.description}</p>
                    <div className="cd-view-applicant">
                      <span className="cd-activity-time">
                        {formatRelativeTime(activity.created_at)}
                      </span>
                      <button
                        className="cd-view-profile"
                        onClick={() => {
                          if (application) {
                            setModalError("");
                            setSelectedApplication(application);
                            return;
                          }
                          navigate("/Recruiter/ViewApplicants");
                        }}
                      >
                        View Candidate Profile
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="cd-activity-item">
                <p>No recent activity is available. New applications and status updates will appear here.</p>
                <div className="cd-view-applicant">
                  <span className="cd-activity-time">Awaiting Updates</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="cd-footer">
          <p>@2026 Placement Portal NIT AP. All rights reserved.</p>
        </footer>
      </div>

      <ApplicantProfileModal
        open={Boolean(selectedApplication)}
        application={selectedApplication}
        statuses={statuses}
        busy={savingId === selectedApplication?.id}
        error={modalError}
        onClose={() => {
          setSelectedApplication(null);
          setModalError("");
        }}
        onSubmit={handleStatusUpdate}
      />
    </>
  );
}

export default RecruiterDashboard;
