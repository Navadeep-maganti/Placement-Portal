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

  const eligibilityCards = useMemo(() => {
    if (!job) {
      return [];
    }

    return [
      {
        label: "Minimum CGPA",
        value: `${job.eligibility_details?.min_cgpa ?? job.eligibility_cgpa}`,
      },
      {
        label: "Backlogs",
        value: `${job.eligibility_details?.max_backlogs ?? "No explicit limit"}`,
      },
      {
        label: "Graduation Year",
        value: job.eligibility_details?.graduation_year || "Open to multiple batches",
      },
      {
        label: "Departments",
        value: job.eligibility_details?.allowed_departments?.length
          ? job.eligibility_details.allowed_departments.join(", ")
          : "All departments",
      },
    ];
  }, [job]);

  const statusTone = job?.has_applied
    ? "applied"
    : job?.is_eligible
      ? "eligible"
      : "blocked";

  const statusLabel = job?.has_applied
    ? formatStatusLabel(job.application_status)
    : job?.is_eligible
      ? "Eligible to apply"
      : "Not eligible yet";

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
        <section className="jd-hero">
          <div className="jd-hero-main">
            <div className="jd-hero-topline">
              <span className="jd-hero-pill">Live Opportunity</span>
              <span className={`jd-status-chip ${statusTone}`}>{statusLabel}</span>
            </div>

            <div className="jd-title-row">
              <div className="jd-company-mark">
                {(job.company_name || "J").charAt(0).toUpperCase()}
              </div>
              <div className="jd-title-copy">
                <h1>{job.job_title}</h1>
                <p>{job.company_name}</p>
              </div>
            </div>

            <p className="jd-hero-summary">
              {job.job_description || "No job description provided yet."}
            </p>

            <div className="jd-hero-actions">
              <button
                className={`jd-bookmark-btn ${job.is_bookmarked ? "active" : ""}`}
                onClick={handleBookmark}
              >
                {job.is_bookmarked ? "Saved" : "Save Job"}
              </button>
              {job.company_website && (
                <a
                  className="jd-site-link"
                  href={job.company_website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit Company Site
                </a>
              )}
            </div>
          </div>

          <div className="jd-facts-grid">
            {overviewItems.map((item) => (
              <div key={item.label} className="jd-fact-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <div className="jd-layout">
          <main className="jd-main">
            <section className="jd-section">
              <div className="jd-section-head">
                <h2>Role Snapshot</h2>
                <span>What stands out</span>
              </div>
              <div className="jd-copy-card">
                <p>{job.job_description || "No job description provided yet."}</p>
              </div>
            </section>

            <section className="jd-section">
              <div className="jd-section-head">
                <h2>Required Skills</h2>
                <span>
                  {job.required_skill_names?.length || 0} highlighted
                </span>
              </div>
              <div className="jd-skill-wrap">
                {(job.required_skill_names?.length
                  ? job.required_skill_names
                  : ["No specific skills listed"]
                ).map((skill, idx) => (
                  <span key={idx} className="jd-skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section className="jd-section">
              <div className="jd-section-head">
                <h2>Eligibility</h2>
                <span>Before you apply</span>
              </div>
              <div className="jd-eligibility-grid">
                {eligibilityCards.map((item) => (
                  <div key={item.label} className="jd-eligibility-card">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
              {job.eligibility_issues?.length > 0 && (
                <div className="jd-warning-panel">
                  <h3>Eligibility issues to fix</h3>
                  <ul className="jd-list">
                    {job.eligibility_issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="jd-section">
              <div className="jd-section-head">
                <h2>About the Company</h2>
                <span>{job.company_industry || "Industry not listed"}</span>
              </div>
              <div className="jd-company-card">
                <p>{job.company_description || "No company overview provided."}</p>
                {job.company_website && (
                  <p className="jd-company-link">
                    Company website:{" "}
                    <a href={job.company_website} target="_blank" rel="noreferrer">
                      {job.company_website}
                    </a>
                  </p>
                )}
              </div>
            </section>
          </main>

          <aside className="jd-sidebar">
            <div className="jd-apply-card">
              <div className={`jd-apply-status ${statusTone}`}>
                {job.has_applied
                  ? "Application in tracker"
                  : job.is_eligible
                    ? "Ready to apply"
                    : "Action needed"}
              </div>

              <h3>
                {job.has_applied
                  ? formatStatusLabel(job.application_status)
                  : "Make your move"}
              </h3>
              <p>
                {job.has_applied
                  ? "Your application is already submitted and being tracked."
                  : job.is_eligible
                    ? "Your profile currently matches the listed requirements for this role."
                    : "Review the requirements below and update your profile before applying."}
              </p>

              <button
                className={`jd-apply-btn ${job.has_applied ? "applied" : ""}`}
                onClick={() => setApplyModalOpen(true)}
                disabled={job.has_applied || !job.is_eligible}
              >
                {job.has_applied ? formatStatusLabel(job.application_status) : "Apply Now"}
              </button>

              {!auth.user.resume && job.resume_required && (
                <p className="jd-inline-note">
                  This job requires a resume. Update it from{" "}
                  <Link to="/student/profile">your profile</Link>.
                </p>
              )}

              <div className="jd-sidebar-meta">
                <div>
                  <span>Applicants</span>
                  <strong>{job.no_of_applicants ?? 0}</strong>
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
            </div>
          </aside>
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
