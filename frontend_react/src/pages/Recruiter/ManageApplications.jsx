import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/css/Manage.css";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";

function Manage() {
  const { auth, loading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [remarks, setRemarks] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchManageData = async () => {
      try {
        setError("");
        const [applicationsResponse, statusesResponse] = await Promise.all([
          api.get("/applications/company-applicants/"),
          api.get("/applications/statuses/"),
        ]);

        const applicationRows = applicationsResponse.data || [];
        const statusRows = statusesResponse.data || [];

        setApplications(applicationRows);
        setStatuses(statusRows);
        setSelectedStatuses(
          Object.fromEntries(
            applicationRows.map((application) => [application.id, ""])
          )
        );
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.error ||
            "Failed to load application management data."
        );
      } finally {
        setPageLoading(false);
      }
    };

    if (!loading && auth.user) {
      fetchManageData();
    } else if (!loading) {
      setPageLoading(false);
    }
  }, [loading, auth.user]);

  const statusLabel = (status) =>
    status?.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()) ||
    "Unknown";

  const filteredApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesQuery =
        !query ||
        application.applicant_name?.toLowerCase().includes(query) ||
        application.student_registration_no?.toLowerCase().includes(query) ||
        application.job_title?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || application.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const stats = useMemo(
    () => ({
      total: applications.length,
      applied: applications.filter((application) => application.status === "applied")
        .length,
      shortlisted: applications.filter(
        (application) => application.status === "shortlisted"
      ).length,
      offered: applications.filter((application) => application.status === "offered")
        .length,
    }),
    [applications]
  );

  const handleStatusUpdate = async (applicationId) => {
    const selectedStatusId = selectedStatuses[applicationId];
    if (!selectedStatusId) {
      setError("Please choose a new status before updating.");
      return;
    }

    try {
      setSavingId(applicationId);
      setError("");
      setFeedback("");

      const response = await api.patch(
        `/applications/${applicationId}/status/`,
        {
          status_id: Number(selectedStatusId),
          remarks: remarks[applicationId] || "",
        }
      );

      setApplications((prev) =>
        prev.map((application) =>
          application.id === applicationId ? response.data : application
        )
      );
      setSelectedStatuses((prev) => ({ ...prev, [applicationId]: "" }));
      setRemarks((prev) => ({ ...prev, [applicationId]: "" }));
      setFeedback("Application status updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to update application status."
      );
    } finally {
      setSavingId(null);
    }
  };

  if (loading || pageLoading) return <p>Loading applications...</p>;
  if (!auth.user) return <p>No user data</p>;

  return (
    <>
      <CompanyNavbar Company={auth.user} />
      <div className="mg-page">
        <main className="mg-container">
          <section className="mg-hero">
            <div>
              <h1>Manage Applications</h1>
              <p>Review progress, move candidates forward, and keep every job pipeline updated.</p>
              {error && <p className="mg-inline-message mg-error">{error}</p>}
              {feedback && <p className="mg-inline-message mg-success">{feedback}</p>}
            </div>
            <button
              className="mg-primary-btn"
              onClick={() => navigate("/Recruiter/ViewApplicants")}
            >
              View Applicants
            </button>
          </section>

          <section className="mg-stats-grid">
            <div className="mg-stat-card">
              <span className="mg-stat-label">Total Applications</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="mg-stat-card">
              <span className="mg-stat-label">Applied</span>
              <strong>{stats.applied}</strong>
            </div>
            <div className="mg-stat-card">
              <span className="mg-stat-label">Shortlisted</span>
              <strong>{stats.shortlisted}</strong>
            </div>
            <div className="mg-stat-card">
              <span className="mg-stat-label">Offered</span>
              <strong>{stats.offered}</strong>
            </div>
          </section>

          <section className="mg-toolbar">
            <input
              className="mg-search"
              type="text"
              placeholder="Search by applicant, reg no, or role..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <select
              className="mg-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="offered">Offered</option>
              <option value="offer_accepted">Offer Accepted</option>
              <option value="offer_declined">Offer Declined</option>
              <option value="rejected">Rejected</option>
            </select>
          </section>

          <section className="mg-list">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <article key={application.id} className="mg-card">
                  <div className="mg-card-header">
                    <div>
                      <h2>{application.applicant_name || "Unnamed Applicant"}</h2>
                      <p className="mg-subtitle">
                        {application.job_title} {" • "} {application.student_registration_no}
                      </p>
                    </div>
                    <span className={`mg-status mg-status-${application.status}`}>
                      {statusLabel(application.status)}
                    </span>
                  </div>

                  <div className="mg-info-grid">
                    <div>
                      <span className="mg-field-label">Email</span>
                      <p>{application.applicant_email || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="mg-field-label">Department</span>
                      <p>{application.applicant_department || "N/A"}</p>
                    </div>
                    <div>
                      <span className="mg-field-label">CGPA</span>
                      <p>{application.applicant_cgpa ?? "N/A"}</p>
                    </div>
                    <div>
                      <span className="mg-field-label">Applied On</span>
                      <p>{new Date(application.application_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mg-update-panel">
                    <div className="mg-update-field">
                      <label className="mg-field-label" htmlFor={`status-${application.id}`}>
                        New Status
                      </label>
                      <select
                        id={`status-${application.id}`}
                        className="mg-select"
                        value={selectedStatuses[application.id] || ""}
                        onChange={(event) =>
                          setSelectedStatuses((prev) => ({
                            ...prev,
                            [application.id]: event.target.value,
                          }))
                        }
                      >
                        <option value="">Select a status</option>
                        {statuses.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mg-update-field">
                      <label className="mg-field-label" htmlFor={`remarks-${application.id}`}>
                        Remarks
                      </label>
                      <textarea
                        id={`remarks-${application.id}`}
                        className="mg-textarea"
                        rows="3"
                        placeholder="Add recruiter notes for this update..."
                        value={remarks[application.id] || ""}
                        onChange={(event) =>
                          setRemarks((prev) => ({
                            ...prev,
                            [application.id]: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <button
                      className="mg-primary-btn"
                      disabled={savingId === application.id}
                      onClick={() => handleStatusUpdate(application.id)}
                    >
                      {savingId === application.id ? "Updating..." : "Update Status"}
                    </button>
                  </div>

                  <div className="mg-history">
                    <span className="mg-field-label">Recent History</span>
                    {application.status_history?.length > 0 ? (
                      application.status_history.slice(0, 3).map((entry) => (
                        <div key={entry.id} className="mg-history-item">
                          <strong>
                            {entry.previous_status_name
                              ? `${entry.previous_status_name} to ${entry.new_status_name}`
                              : entry.new_status_name}
                          </strong>
                          <span>{new Date(entry.changed_at).toLocaleString()}</span>
                          <p>{entry.remarks || "No remarks provided."}</p>
                        </div>
                      ))
                    ) : (
                      <p className="mg-history-empty">No history available yet.</p>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="mg-empty">
                <h2>No applications found</h2>
                <p>Try adjusting your filters or wait for new applicants to arrive.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

export default Manage;
