import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/css/JobsList.css";
import StudentNavbar from "../../components/Navbar/StudentNavbar";
import StudentFooter from "../../components/Footer/StudentFooter";
import ApplicationReviewModal from "../../components/Student/ApplicationReviewModal";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import { formatStatusLabel } from "../../utils/studentApplication";

const JobsList = () => {
  const navigate = useNavigate();
  const { auth, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterSalary, setFilterSalary] = useState("all");
  const [viewType, setViewType] = useState("grid");
  const [pageLoading, setPageLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setError("");
        const response = await api.get("/placements/allplacements/");
        setJobs(response.data || []);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch jobs");
      } finally {
        setPageLoading(false);
      }
    };

    if (!loading && auth.user) {
      fetchJobs();
    } else if (!loading) {
      setPageLoading(false);
    }
  }, [loading, auth.user]);

  const normalizedJobs = useMemo(() => {
    return (jobs || []).map((job) => {
      const numericSalary = Number.parseFloat(job.salary);
      return {
        ...job,
        title: job.job_title || "",
        company_display: job.company_name || "Unknown Company",
        skills_display: Array.isArray(job.required_skill_names)
          ? job.required_skill_names
          : [],
        location_display: job.company_location || "N/A",
        salary_display: job.salary_lpa || "N/A",
        salary_number: Number.isNaN(numericSalary) ? 0 : numericSalary,
        applications_display: job.no_of_applicants ?? 0,
        deadline_display: job.application_deadline
          ? new Date(job.application_deadline).toLocaleDateString()
          : "N/A",
      };
    });
  }, [jobs]);

  const locationOptions = useMemo(() => {
    return [
      "all",
      ...new Set(
        normalizedJobs
          .map((job) => job.location_display)
          .filter((location) => location && location !== "N/A")
      ),
    ];
  }, [normalizedJobs]);

  const filteredJobs = normalizedJobs.filter((job) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      job.title.toLowerCase().includes(query) ||
      job.company_display.toLowerCase().includes(query) ||
      job.skills_display.join(", ").toLowerCase().includes(query);

    const matchesLocation =
      filterLocation === "all" || job.location_display === filterLocation;
    const matchesSalary =
      filterSalary === "all" ||
      (filterSalary === "5-7" &&
        job.salary_number >= 5 &&
        job.salary_number <= 7) ||
      (filterSalary === "7-9" &&
        job.salary_number >= 7 &&
        job.salary_number <= 9) ||
      (filterSalary === "9+" && job.salary_number >= 9);

    return matchesSearch && matchesLocation && matchesSalary;
  });

  const updateJobState = (jobId, updates) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, ...updates } : job))
    );
  };

  const handleBookmark = async (job) => {
    try {
      setError("");
      setFeedback("");
      if (job.is_bookmarked) {
        await api.delete(`/bookmarks/${job.id}/`);
        updateJobState(job.id, { is_bookmarked: false });
        setFeedback("Bookmark removed.");
        return;
      }

      await api.post("/bookmarks/", { placement_id: job.id });
      updateJobState(job.id, { is_bookmarked: true });
      setFeedback("Job bookmarked successfully.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to update bookmark."
      );
    }
  };

  const handleApply = async (applicationProfile) => {
    if (!selectedJob) {
      return;
    }

    try {
      setError("");
      setFeedback("");
      setApplying(true);
      const response = await api.post("/applications/apply/", {
        placement_id: selectedJob.id,
        application_profile: applicationProfile,
      });
      const application = response.data?.application || response.data;
      updateJobState(selectedJob.id, {
        has_applied: true,
        application_status:
          application?.status || selectedJob.application_status || "applied",
      });
      setFeedback(
        response.data?.message || "Application submitted successfully."
      );
      setSelectedJob(null);
    } catch (err) {
      const issues = err.response?.data?.eligibility_issues;
      setError(
        Array.isArray(issues) && issues.length
          ? issues.join(" ")
          : err.response?.data?.detail ||
              err.response?.data?.error ||
              "Failed to apply."
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading || pageLoading) return <p>Loading...</p>;
  if (!auth.user) return <p>No user data</p>;

  return (
    <div className="jl-page">
      <StudentNavbar student={auth.user} />

      <div className="jl-container">
        <div className="jl-header">
          <h1>Explore Opportunities</h1>
          <p>
            Browse open roles, bookmark the best matches, and apply with your
            current profile.
          </p>
          {error && <p className="jl-message jl-error">{error}</p>}
          {feedback && <p className="jl-message jl-success">{feedback}</p>}
        </div>

        <div className="jl-filters">
          <div className="jl-search">
            <input
              type="text"
              placeholder="Search by job title, company, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="jl-filter-row">
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="jl-select"
            >
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location === "all" ? "All Locations" : location}
                </option>
              ))}
            </select>

            <select
              value={filterSalary}
              onChange={(e) => setFilterSalary(e.target.value)}
              className="jl-select"
            >
              <option value="all">All Salaries</option>
              <option value="5-7">5-7 LPA</option>
              <option value="7-9">7-9 LPA</option>
              <option value="9+">9+ LPA</option>
            </select>

            <div className="jl-view-toggle">
              <button
                className={`jl-toggle-btn ${viewType === "grid" ? "active" : ""}`}
                onClick={() => setViewType("grid")}
              >
                Grid
              </button>
              <button
                className={`jl-toggle-btn ${viewType === "list" ? "active" : ""}`}
                onClick={() => setViewType("list")}
              >
                List
              </button>
            </div>
          </div>
        </div>

        <div className="jl-results">
          <p>
            Showing <strong>{filteredJobs.length}</strong> opportunities
          </p>
        </div>

        <div className={`jl-cards ${viewType === "grid" ? "jl-grid" : "jl-list"}`}>
          {filteredJobs.map((job) => (
            <div key={job.id} className="jl-card">
              <div className="jl-card-header">
                <div>
                  <h3>{job.title}</h3>
                  <p className="jl-company">{job.company_display}</p>
                </div>
                <button className="jl-bookmark" onClick={() => handleBookmark(job)}>
                  {job.is_bookmarked ? "SAVED" : "BOOKMARK"}
                </button>
              </div>

              <div className="jl-meta">
                <span className="jl-meta-item">{job.location_display}</span>
                <span className="jl-meta-item">{job.salary_display}</span>
                <span className="jl-meta-item">
                  {job.resume_required ? "Resume Required" : "Resume Optional"}
                </span>
              </div>

              <div className="jl-skills">
                {(job.skills_display.length
                  ? job.skills_display
                  : ["No skills specified"]
                ).map((skill, idx) => (
                  <span key={idx} className="jl-skill">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="jl-footer">
                <span className="jl-applicants">
                  {job.applications_display} applied
                </span>
                <span className="jl-deadline">{job.deadline_display}</span>
              </div>

              <div className="jl-status-row">
                <span
                  className={`jl-status-badge ${
                    job.has_applied ? "applied" : job.is_eligible ? "eligible" : "blocked"
                  }`}
                >
                  {job.has_applied
                    ? formatStatusLabel(job.application_status)
                    : job.is_eligible
                      ? "Eligible"
                      : "Not Eligible"}
                </span>
                {!job.is_eligible && job.eligibility_issues?.length > 0 && (
                  <span className="jl-eligibility-note">
                    {job.eligibility_issues[0]}
                  </span>
                )}
              </div>

              <div className="jl-actions">
                <button
                  className="jl-secondary-action"
                  onClick={() => navigate(`/student/jobs/${job.id}`)}
                >
                  View Details
                </button>
                <button
                  className="jl-apply"
                  onClick={() => setSelectedJob(job)}
                  disabled={job.has_applied || !job.is_eligible}
                >
                  {job.has_applied ? "Already Applied" : "Apply Now"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="jl-empty">
            <p>No jobs found matching your criteria</p>
            <p>Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
      <ApplicationReviewModal
        open={Boolean(selectedJob)}
        student={auth.user}
        job={selectedJob}
        submitting={applying}
        error={error}
        onClose={() => setSelectedJob(null)}
        onSubmit={handleApply}
      />
      <StudentFooter />
    </div>
  );
};

export default JobsList;
