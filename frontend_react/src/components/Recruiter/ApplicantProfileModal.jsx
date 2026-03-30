import React, { useEffect, useState } from "react";
import "../../styles/css/ApplicantProfileModal.css";

const formatStatusLabel = (status) =>
  status?.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()) ||
  "Unknown";

function ApplicantProfileModal({
  open,
  application,
  statuses,
  busy,
  error,
  onClose,
  onSubmit,
}) {
  const [statusId, setStatusId] = useState("");
  const [remarks, setRemarks] = useState("");
  const currentStatusLabel = formatStatusLabel(application?.status);

  useEffect(() => {
    if (!open) {
      setStatusId("");
      setRemarks("");
    }
  }, [open, application?.id]);

  if (!open || !application) {
    return null;
  }

  return (
    <div className="apm-backdrop" onClick={onClose}>
      <div className="apm-modal" onClick={(event) => event.stopPropagation()}>
        <div className="apm-header">
          <div>
            <h2>{application.applicant_name || "Applicant Profile"}</h2>
            <p>
              {application.student_registration_no} {" • "} {application.job_title}
            </p>
          </div>
          <button className="apm-close" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="apm-status-row">
          <span className={`apm-status apm-status-${application.status}`}>
            {formatStatusLabel(application.status)}
          </span>
          <span className="apm-meta">
            Applied on {new Date(application.application_date).toLocaleDateString()}
          </span>
        </div>

        {error && <p className="apm-error">{error}</p>}

        <div className="apm-grid">
          <div>
            <span className="apm-label">Email</span>
            <p>{application.applicant_email || "Not provided"}</p>
          </div>
          <div>
            <span className="apm-label">Phone</span>
            <p>{application.applicant_phone || "Not provided"}</p>
          </div>
          <div>
            <span className="apm-label">Department</span>
            <p>{application.applicant_department || "N/A"}</p>
          </div>
          <div>
            <span className="apm-label">Graduation Year</span>
            <p>{application.applicant_graduation_year || "N/A"}</p>
          </div>
          <div>
            <span className="apm-label">CGPA</span>
            <p>{application.applicant_cgpa ?? "N/A"}</p>
          </div>
          <div>
            <span className="apm-label">Backlogs</span>
            <p>{application.applicant_backlogs ?? 0}</p>
          </div>
          <div>
            <span className="apm-label">Resume</span>
            {application.applicant_resume_url ? (
              <a href={application.applicant_resume_url} target="_blank" rel="noreferrer">
                {application.applicant_resume_name || "Open Resume"}
              </a>
            ) : (
              <p>Not uploaded</p>
            )}
          </div>
        </div>

        <div className="apm-section">
          <span className="apm-label">Skills Summary</span>
          <p>{application.applicant_skills_summary || "No skills summary submitted."}</p>
        </div>

        <div className="apm-section">
          <span className="apm-label">Career Objective</span>
          <p>{application.applicant_career_objective || "No career objective submitted."}</p>
        </div>

        <div className="apm-section">
          <span className="apm-label">Bio</span>
          <p>{application.applicant_bio || "No bio submitted."}</p>
        </div>

        <div className="apm-section">
          <span className="apm-label">Update Status</span>
          <div className="apm-actions">
            <select value={statusId} onChange={(event) => setStatusId(event.target.value)}>
              <option value="">
                Current Status: {currentStatusLabel}
              </option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
            <textarea
              rows="3"
              value={remarks}
              placeholder="Add recruiter notes for this update..."
              onChange={(event) => setRemarks(event.target.value)}
            />
            <button
              type="button"
              className="apm-primary-btn"
              disabled={busy}
              onClick={() => onSubmit({ applicationId: application.id, statusId, remarks })}
            >
              {busy ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>

        <div className="apm-section">
          <span className="apm-label">Recent History</span>
          <div className="apm-history">
            {application.status_history?.length > 0 ? (
              application.status_history.slice(0, 4).map((entry) => (
                <div key={entry.id} className="apm-history-item">
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
              <p>No history available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicantProfileModal;
