import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import StudentNavbar from "../../components/Navbar/StudentNavbar";
import StudentFooter from "../../components/Footer/StudentFooter";
import ConfirmDialog from "../../components/Student/ConfirmDialog";
import PageLoader from "../../components/Common/PageLoader";
import api from "../../utils/api";
import "../../styles/css/MyApplications.css";
import { formatStatusLabel } from "../../utils/studentApplication";

const getStatusColor = (status) => {
  const colors = {
    applied: "#f59e0b",
    shortlisted: "#3b82f6",
    offered: "#10b981",
    offer_accepted: "#047857",
    offer_declined: "#b91c1c",
    rejected: "#ef4444",
  };
  return colors[status] || "#6b7280";
};

const MyApplications = () => {
  const { auth, loading } = useAuth();
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [applications, setApplications] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [declineTarget, setDeclineTarget] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setError("");
        const response = await api.get("/applications/myapplications/");
        setApplications(response.data || []);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Failed to load applications. Please log in again."
        );
      } finally {
        setPageLoading(false);
      }
    };

    if (!loading && auth.user) {
      fetchApplications();
    } else if (!loading) {
      setPageLoading(false);
    }
  }, [loading, auth.user]);

  if (loading || pageLoading) return <PageLoader />;
  if (!auth.user) return <p>No user data</p>;

  const handleOfferDecision = async (applicationId, decision) => {
    try {
      setProcessingId(applicationId);
      setError("");
      setFeedback("");
      const response = await api.post(
        `/applications/${applicationId}/offer-decision/`,
        { decision }
      );
      setApplications((prev) =>
        prev.map((application) =>
          application.id === applicationId ? response.data : application
        )
      );
      setFeedback(
        decision === "accept"
          ? "Offer accepted successfully."
          : "Offer declined successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to update offer decision."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApplications = applications
    .filter((app) => filterStatus === "all" || app.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.application_date) - new Date(a.application_date);
      }
      if (sortBy === "oldest") {
        return new Date(a.application_date) - new Date(b.application_date);
      }
      if (sortBy === "deadline") {
        return new Date(a.application_deadline) - new Date(b.application_deadline);
      }
      return 0;
    });

  const offeredCount = applications.filter((app) =>
    ["offered", "offer_accepted", "offer_declined"].includes(app.status)
  ).length;

  return (
    <div className="ma-my-applications-page">
      <StudentNavbar student={auth.user} />

      <div className="ma-applications-container">
        <div className="ma-applications-header">
          <h1>My Applications</h1>
          <p>Track applications, offer outcomes, and recruiter status updates.</p>
          {error && <p className="ma-inline-message ma-error">{error}</p>}
          {feedback && <p className="ma-inline-message ma-success">{feedback}</p>}
        </div>

        <div className="ma-stats-cards">
          <div className="ma-stat-card">
            <div className="ma-stat-number">{applications.length}</div>
            <div className="ma-stat-label">Total Applied</div>
          </div>
          <div className="ma-stat-card">
            <div className="ma-stat-number">
              {applications.filter((a) => a.status === "shortlisted").length}
            </div>
            <div className="ma-stat-label">Shortlisted</div>
          </div>
          <div className="ma-stat-card">
            <div className="ma-stat-number">{offeredCount}</div>
            <div className="ma-stat-label">Offers</div>
          </div>
          <div className="ma-stat-card">
            <div className="ma-stat-number">
              {
                applications.filter((a) =>
                  ["offer_accepted", "offer_declined"].includes(a.status)
                ).length
              }
            </div>
            <div className="ma-stat-label">Offer Decisions</div>
          </div>
        </div>

        <div className="ma-filters-section">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="ma-filter-select"
          >
            <option value="all">All Status</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="offered">Offered</option>
            <option value="offer_accepted">Offer Accepted</option>
            <option value="offer_declined">Offer Declined</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ma-filter-select"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="deadline">Deadline First</option>
          </select>
        </div>

        <div className="ma-applications-list">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app) => (
              <div key={app.id} className="ma-application-card">
                <div className="ma-app-header">
                  <div className="ma-app-title-section">
                    <h3>{app.job_title}</h3>
                    <p className="ma-company-name">{app.company_name}</p>
                  </div>
                  <span
                    className="ma-status-badge"
                    style={{ backgroundColor: getStatusColor(app.status) }}
                  >
                    {formatStatusLabel(app.status)}
                  </span>
                </div>

                <div className="ma-app-details">
                  <span>Reg No: {app.student_registration_no}</span>
                  <span>{app.company_location || "Location pending"}</span>
                  <span>{app.salary_lpa || "Salary pending"}</span>
                  <span>
                    Applied: {new Date(app.application_date).toLocaleDateString()}
                  </span>
                  <span>
                    Deadline:{" "}
                    {app.application_deadline
                      ? new Date(app.application_deadline).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                {app.status === "offered" && (
                  <div className="ma-offer-actions">
                    <button
                      className="ma-offer-btn accept"
                      disabled={processingId === app.id}
                      onClick={() => handleOfferDecision(app.id, "accept")}
                    >
                      {processingId === app.id ? "Updating..." : "Accept Offer"}
                    </button>
                    <button
                      className="ma-offer-btn decline"
                      disabled={processingId === app.id}
                      onClick={() => setDeclineTarget(app)}
                    >
                      {processingId === app.id ? "Updating..." : "Decline Offer"}
                    </button>
                  </div>
                )}

                <div className="ma-app-next-step">
                  <strong>Latest update:</strong>{" "}
                  {app.status_history?.[0]?.remarks ||
                    `Application is currently ${formatStatusLabel(app.status).toLowerCase()}.`}
                </div>

                {app.application_profile && (
                  <div className="ma-profile-snapshot">
                    <span>
                      Submitted profile: {app.application_profile.first_name}{" "}
                      {app.application_profile.last_name}
                    </span>
                    <span>CGPA {app.application_profile.cgpa}</span>
                    <span>{app.application_profile.phone || "Phone not added"}</span>
                  </div>
                )}

                {app.status_history?.length > 0 && (
                  <div className="ma-history">
                    {app.status_history.slice(0, 3).map((entry) => (
                      <div key={entry.id} className="ma-history-item">
                        <span className="ma-history-status">
                          {entry.previous_status_name
                            ? `${entry.previous_status_name} to ${entry.new_status_name}`
                            : entry.new_status_name}
                        </span>
                        <span className="ma-history-date">
                          {new Date(entry.changed_at).toLocaleString()}
                        </span>
                        {entry.remarks && (
                          <p className="ma-history-remarks">{entry.remarks}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="ma-no-applications">
              <p>No applications found</p>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(declineTarget)}
        title="Decline this offer?"
        description={
          declineTarget
            ? `You are about to decline the offer for ${declineTarget.job_title} at ${declineTarget.company_name}.`
            : ""
        }
        confirmLabel="Yes, Decline Offer"
        busy={processingId === declineTarget?.id}
        onCancel={() => setDeclineTarget(null)}
        onConfirm={async () => {
          if (!declineTarget) {
            return;
          }
          await handleOfferDecision(declineTarget.id, "decline");
          setDeclineTarget(null);
        }}
      />
      <StudentFooter />
    </div>
  );
};

export default MyApplications;
