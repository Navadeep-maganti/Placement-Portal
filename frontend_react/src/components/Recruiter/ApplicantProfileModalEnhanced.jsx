import React, { useEffect, useState } from "react";
import {
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiMail,
  FiPhone,
  FiUser,
  FiX,
} from "react-icons/fi";
import "../../styles/css/ApplicantProfileModalEnhanced.css";

const formatStatusLabel = (status) =>
  status?.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()) ||
  "Unknown";

function ApplicantProfileModalEnhanced({
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
    <div className="apme-backdrop" onClick={onClose}>
      <div className="apme-modal" onClick={(event) => event.stopPropagation()}>
        <div className="apme-header">
          <div className="apme-hero">
            <div className="apme-avatar" aria-hidden="true">
              <FiUser size={28} />
            </div>
            <div className="apme-hero-copy">
              <div className="apme-hero-topline">
                <span className={`apme-status apme-status-${application.status}`}>
                  {formatStatusLabel(application.status)}
                </span>
                <span className="apme-meta">
                  Applied on {new Date(application.application_date).toLocaleDateString()}
                </span>
              </div>
              <h2>{application.applicant_name || "Applicant Profile"}</h2>
              <p>
                {application.student_registration_no} {" • "} {application.job_title}
              </p>
            </div>
          </div>
          <button
            className="apme-close"
            onClick={onClose}
            type="button"
            aria-label="Close applicant profile"
          >
            <FiX size={18} />
          </button>
        </div>

        {error && <p className="apme-error">{error}</p>}

        <div className="apme-summary-grid">
          <div className="apme-summary-card">
            <span className="apme-summary-icon">
              <FiMail size={16} />
            </span>
            <div>
              <span className="apme-label">Email</span>
              <p>{application.applicant_email || "Not provided"}</p>
            </div>
          </div>
          <div className="apme-summary-card">
            <span className="apme-summary-icon">
              <FiPhone size={16} />
            </span>
            <div>
              <span className="apme-label">Phone</span>
              <p>{application.applicant_phone || "Not provided"}</p>
            </div>
          </div>
          <div className="apme-summary-card">
            <span className="apme-summary-icon">
              <FiBookOpen size={16} />
            </span>
            <div>
              <span className="apme-label">Department</span>
              <p>{application.applicant_department || "N/A"}</p>
            </div>
          </div>
          <div className="apme-summary-card">
            <span className="apme-summary-icon">
              <FiCalendar size={16} />
            </span>
            <div>
              <span className="apme-label">Graduation Year</span>
              <p>{application.applicant_graduation_year || "N/A"}</p>
            </div>
          </div>
          <div className="apme-summary-card">
            <span className="apme-summary-icon">
              <FiAward size={16} />
            </span>
            <div>
              <span className="apme-label">CGPA</span>
              <p>{application.applicant_cgpa ?? "N/A"}</p>
            </div>
          </div>
          <div className="apme-summary-card">
            <span className="apme-summary-icon">
              <FiCheckCircle size={16} />
            </span>
            <div>
              <span className="apme-label">Backlogs</span>
              <p>{application.applicant_backlogs ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="apme-layout">
          <div className="apme-main-column">
            <div className="apme-section apme-section-surface">
              <span className="apme-label">Professional Summary</span>
              <div className="apme-copy-block">
                <div>
                  <span className="apme-copy-heading">Skills Summary</span>
                  <p>{application.applicant_skills_summary || "No skills summary submitted."}</p>
                </div>
                <div>
                  <span className="apme-copy-heading">Career Objective</span>
                  <p>{application.applicant_career_objective || "No career objective submitted."}</p>
                </div>
                <div>
                  <span className="apme-copy-heading">Bio</span>
                  <p>{application.applicant_bio || "No bio submitted."}</p>
                </div>
              </div>
            </div>

            <div className="apme-section apme-section-surface">
              <span className="apme-label">Recent History</span>
              <div className="apme-history">
                {application.status_history?.length > 0 ? (
                  application.status_history.slice(0, 4).map((entry) => (
                    <div key={entry.id} className="apme-history-item">
                      <div className="apme-history-top">
                        <strong>
                          {entry.previous_status_name
                            ? `${entry.previous_status_name} to ${entry.new_status_name}`
                            : entry.new_status_name}
                        </strong>
                        <span>{new Date(entry.changed_at).toLocaleString()}</span>
                      </div>
                      <p>{entry.remarks || "No remarks provided."}</p>
                    </div>
                  ))
                ) : (
                  <p className="apme-muted">No history available yet.</p>
                )}
              </div>
            </div>
          </div>

          <aside className="apme-side-column">
            <div className="apme-section apme-actions-card">
              <span className="apme-label">Update Status</span>
              <div className="apme-actions-head">
                <div>
                  <p className="apme-actions-title">Status Management</p>
                  <p className="apme-actions-subtitle">
                    Move this candidate forward and leave context for the student.
                  </p>
                </div>
                <span className={`apme-status apme-status-${application.status}`}>
                  {currentStatusLabel}
                </span>
              </div>
              <div className="apme-actions">
                <div className="apme-field">
                  <label className="apme-field-label" htmlFor="apme-status-select">
                    New Status
                  </label>
                  <select
                    id="apme-status-select"
                    value={statusId}
                    onChange={(event) => setStatusId(event.target.value)}
                  >
                    <option value="">Select a status</option>
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="apme-field">
                  <label className="apme-field-label" htmlFor="apme-remarks">
                    Recruiter Remarks
                  </label>
                  <textarea
                    id="apme-remarks"
                    rows="5"
                    value={remarks}
                    placeholder="Add a clear note for this update..."
                    onChange={(event) => setRemarks(event.target.value)}
                  />
                </div>
                <div className="apme-actions-footer">
                  <button
                    type="button"
                    className="apme-primary-btn"
                    disabled={busy}
                    onClick={() => onSubmit({ applicationId: application.id, statusId, remarks })}
                  >
                    {busy ? "Updating Status..." : "Save Status Update"}
                  </button>
                </div>
              </div>
            </div>

            <div className="apme-section apme-section-surface">
              <span className="apme-label">Resume</span>
              {application.applicant_resume_url ? (
                <a
                  className="apme-resume-link"
                  href={application.applicant_resume_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FiDownload size={16} />
                  <span>{application.applicant_resume_name || "Open Resume"}</span>
                </a>
              ) : (
                <div className="apme-empty-card">
                  <FiFileText size={18} />
                  <p>Resume not uploaded.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ApplicantProfileModalEnhanced;
