import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/css/StudentModal.css";
import {
  createApplicationDraft,
  normalizeApplicationProfile,
} from "../../utils/studentApplication";

function ApplicationReviewModal({
  open,
  student,
  job,
  submitting,
  error,
  onClose,
  onSubmit,
}) {
  const [draft, setDraft] = useState(() => createApplicationDraft(student));

  useEffect(() => {
    if (open) {
      setDraft(createApplicationDraft(student));
    }
  }, [open, student, job?.id]);

  if (!open || !job) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(normalizeApplicationProfile(draft));
  };

  return (
    <div className="sm-overlay" role="dialog" aria-modal="true">
      <div className="sm-panel sm-panel-large">
        <div className="sm-header">
          <div>
            <p className="sm-eyebrow">Application Review</p>
            <h2>Apply to {job.job_title}</h2>
            <p>
              Review your details before submission. Changes here apply only to
              this job application.
            </p>
          </div>
          <button className="sm-close" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="sm-highlight">
          <div>
            <span>Company</span>
            <strong>{job.company_name}</strong>
          </div>
          <div>
            <span>Package</span>
            <strong>{job.salary_lpa || "N/A"}</strong>
          </div>
          <div>
            <span>Deadline</span>
            <strong>
              {job.application_deadline
                ? new Date(job.application_deadline).toLocaleDateString()
                : "N/A"}
            </strong>
          </div>
        </div>

        {error && <p className="sm-message sm-error">{error}</p>}

        <form className="sm-form" onSubmit={handleSubmit}>
          <div className="sm-grid">
            <label>
              First Name
              <input
                name="first_name"
                value={draft.first_name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Last Name
              <input
                name="last_name"
                value={draft.last_name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={draft.email}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Phone
              <input name="phone" value={draft.phone} onChange={handleChange} />
            </label>
            <label>
              Registration Number
              <input name="registration_no" value={draft.registration_no} disabled />
            </label>
            <label>
              Department
              <input
                name="department"
                value={draft.department}
                onChange={handleChange}
              />
            </label>
            <label>
              Graduation Year
              <input
                type="number"
                name="graduation_year"
                value={draft.graduation_year}
                onChange={handleChange}
              />
            </label>
            <label>
              CGPA
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="cgpa"
                value={draft.cgpa}
                onChange={handleChange}
              />
            </label>
            <label>
              Active Backlogs
              <input
                type="number"
                min="0"
                name="active_backlogs"
                value={draft.active_backlogs}
                onChange={handleChange}
              />
            </label>
            <label>
              LinkedIn URL
              <input
                type="url"
                name="linkedin_url"
                value={draft.linkedin_url}
                onChange={handleChange}
              />
            </label>
            <label>
              Portfolio URL
              <input
                type="url"
                name="portfolio_url"
                value={draft.portfolio_url}
                onChange={handleChange}
              />
            </label>
          </div>

          <label className="sm-full">
            Career Objective
            <textarea
              name="career_objective"
              rows="3"
              value={draft.career_objective}
              onChange={handleChange}
            />
          </label>

          <label className="sm-full">
            Skills Summary
            <textarea
              name="skills_summary"
              rows="3"
              value={draft.skills_summary}
              onChange={handleChange}
            />
          </label>

          <label className="sm-full">
            Bio
            <textarea
              name="bio"
              rows="4"
              value={draft.bio}
              onChange={handleChange}
            />
          </label>

          <div className="sm-footer">
            <p>
              Need to update your main profile too?{" "}
              <Link to="/student/profile">Open profile management</Link>
            </p>
            <div className="sm-actions">
              <button type="button" className="sm-secondary-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="sm-primary-btn" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplicationReviewModal;
