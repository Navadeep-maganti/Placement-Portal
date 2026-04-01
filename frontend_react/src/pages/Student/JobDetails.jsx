import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StudentNavbar from "../../components/Navbar/StudentNavbar";
import StudentFooter from "../../components/Footer/StudentFooter";
import ApplicationReviewModal from "../../components/Student/ApplicationReviewModal";
import PageLoader from "../../components/Common/PageLoader";
import RecruiterToast from "../../components/Recruiter/RecruiterToast";
import { useAuth } from "../../contexts/AuthContext";
import useRecruiterToast from "../../hooks/useRecruiterToast";
import api from "../../utils/api";
import "../../styles/css/JobDetails.css";
import { formatStatusLabel } from "../../utils/studentApplication";

const JobDetails = () => {
  const { jobId } = useParams();
  const { auth, loading } = useAuth();
  const [job, setJob] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const { toast, showToast } = useRecruiterToast();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setError("");
        const response = await api.get(`/placements/${jobId}/`);
        setJob(response.data);
      } catch (err) {
        const message = err.response?.data?.detail || "Failed to load job details.";
        setError(message);
        showToast(message, "error");
      } finally {
        setPageLoading(false);
      }
    };

    if (!loading && auth.user) {
      fetchJob();
    } else if (!loading) {
      setPageLoading(false);
    }
  }, [auth.user, jobId, loading]);

  const overviewItems = useMemo(() => {
    if (!job) {
      return [];
    }

    return [
      { label: "Salary", value: job.salary_lpa || "N/A" },
      { label: "Location", value: job.company_location || "N/A" },
      { label: "Industry", value: job.company_industry || "N/A" },
      {
        label: "Deadline",
        value: job.application_deadline
          ? new Date(job.application_deadline).toLocaleDateString()
          : "N/A",
      },
      { label: "Applicants", value: job.no_of_applicants ?? 0 },
      {
        label: "Resume",
        value: job.resume_required ? "Required" : "Optional",
      },
    ];
  }, [job]);

  if (loading || pageLoading) return <PageLoader />;
  if (!auth.user) return <p>Please log in to view job details</p>;

  const handleBookmark = async () => {
    if (!job) {
      return;
    }

    try {
      setError("");
      if (job.is_bookmarked) {
        await api.delete(`/bookmarks/${job.id}/`);
        setJob((prev) => ({ ...prev, is_bookmarked: false }));
        showToast("Bookmark removed.");
        return;
      }

      await api.post("/bookmarks/", { placement_id: job.id });
      setJob((prev) => ({ ...prev, is_bookmarked: true }));
      showToast("Job bookmarked successfully.");
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Failed to update bookmark.";
      setError(message);
      showToast(message, "error");
    }
  };

  const handleApply = async (applicationProfile) => {
    if (!job) {
      return;
    }

    try {
      setError("");
      setApplying(true);
      const response = await api.post("/applications/apply/", {
        placement_id: job.id,
        application_profile: applicationProfile,
      });
      const application = response.data?.application || response.data;
      setJob((prev) => ({
        ...prev,
        has_applied: true,
        application_status: application?.status || prev.application_status || "applied",
      }));
      showToast(response.data?.message || "Application submitted successfully.");
      setApplyModalOpen(false);
    } catch (err) {
      const issues = err.response?.data?.eligibility_issues;
      const message =
        Array.isArray(issues) && issues.length
          ? issues.join(" ")
          : err.response?.data?.detail ||
            err.response?.data?.error ||
            "Failed to apply.";
      setError(message);
      showToast(message, "error");
    } finally {
      setApplying(false);
    }
  };

  if (!job) {
    return (
      <div className="job-details-page">
        <StudentNavbar student={auth.user} />
        <div className="job-details-container">
          <p>{error || "Job not found."}</p>
        </div>
        <StudentFooter />
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <RecruiterToast toast={toast} modalOpen={applyModalOpen} />
      <StudentNavbar student={auth.user} />

      <div className="job-details-container">
        <div className="job-header-section">
          <div className="job-header-content">
            <div className="job-title-block">
              <div className="company-logo">
                {(job.company_name || "J").charAt(0).toUpperCase()}
              </div>
              <div>
                <h1>{job.job_title}</h1>
                <p className="company-name">{job.company_name}</p>
              </div>
            </div>
            <div className="header-actions">
              <button
                className={`bookmark-btn ${job.is_bookmarked ? "active" : ""}`}
                onClick={handleBookmark}
              >
                {job.is_bookmarked ? "Bookmarked" : "Bookmark"}
              </button>
            </div>
          </div>

          <div className="quick-info">
            {overviewItems.map((item) => (
              <div key={item.label} className="info-item">
                <span className="info-label">{item.label}</span>
                <span className="info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="job-content">
          <div className="apply-section">
            <button
              className={`apply-btn-large ${job.has_applied ? "applied" : ""}`}
              onClick={() => setApplyModalOpen(true)}
              disabled={job.has_applied || !job.is_eligible}
            >
              {job.has_applied ? formatStatusLabel(job.application_status) : "Apply Now"}
            </button>
            <p className="applied-message">
              {job.has_applied
                ? "Your application is already in the tracker."
                : job.is_eligible
                  ? "You are eligible for this role."
                  : "You need to fix the listed eligibility issues before applying."}
            </p>
            {!auth.user.resume && job.resume_required && (
              <p className="job-inline-note">
                This job requires a resume. Update it from{" "}
                <Link to="/student/profile">your profile</Link>.
              </p>
            )}
          </div>

          <section className="job-section">
            <h2>About This Role</h2>
            <p>{job.job_description || "No job description provided yet."}</p>
          </section>

          <section className="job-section">
            <h2>Required Skills</h2>
            <div className="skills-container">
              {(job.required_skill_names?.length
                ? job.required_skill_names
                : ["No specific skills listed"]
              ).map((skill, idx) => (
                <span key={idx} className="skill-badge">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section className="job-section">
            <h2>Eligibility</h2>
            <div className="benefits-grid">
              <div className="benefit-item">
                <span className="benefit-icon">CGPA</span>
                <span>
                  Minimum {job.eligibility_details?.min_cgpa ?? job.eligibility_cgpa}
                </span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">Backlogs</span>
                <span>
                  {job.eligibility_details?.max_backlogs ?? "No explicit limit"}
                </span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">Batch</span>
                <span>
                  {job.eligibility_details?.graduation_year || "Open to multiple batches"}
                </span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">Dept</span>
                <span>
                  {job.eligibility_details?.allowed_departments?.length
                    ? job.eligibility_details.allowed_departments.join(", ")
                    : "All departments"}
                </span>
              </div>
            </div>
            {job.eligibility_issues?.length > 0 && (
              <ul className="job-list">
                {job.eligibility_issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="job-section">
            <h2>About The Company</h2>
            <p>{job.company_description || "No company overview provided."}</p>
            {job.company_website && (
              <p className="job-company-link">
                Company website:{" "}
                <a href={job.company_website} target="_blank" rel="noreferrer">
                  {job.company_website}
                </a>
              </p>
            )}
          </section>
        </div>
      </div>
      <ApplicationReviewModal
        open={applyModalOpen}
        student={auth.user}
        job={job}
        submitting={applying}
        error={error}
        onClose={() => {
          setApplyModalOpen(false);
          setError("");
        }}
        onSubmit={handleApply}
      />
      <StudentFooter />
    </div>
  );
};

export default JobDetails;
