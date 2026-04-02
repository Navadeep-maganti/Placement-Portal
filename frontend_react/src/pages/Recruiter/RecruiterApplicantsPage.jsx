import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/css/Applications.css";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import ApplicantProfileModalEnhanced from "../../components/Recruiter/ApplicantProfileModalEnhanced";
import PageLoader from "../../components/Common/PageLoader";
import RecruiterFooter from "../../components/Footer/RecruiterFooter";
import RecruiterApprovalPending from "../../components/Recruiter/RecruiterApprovalPending";
import RecruiterToast from "../../components/Recruiter/RecruiterToast";
import { useAuth } from "../../contexts/AuthContext";
import useRecruiterToast from "../../hooks/useRecruiterToast";
import api from "../../utils/api";

const OFFER_STATUSES = ["offered", "offer_accepted", "offer_declined"];

function RecruiterApplicantsPage() {
  const { auth, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isApproved = Boolean(auth.user?.is_approved);
  const [applications, setApplications] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const { toast, showToast } = useRecruiterToast();
  const requestedStatusFilter = location.state?.statusFilter;
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setError("");
        const [applicationsResponse, statusesResponse] = await Promise.all([
          api.get("/applications/company-applicants/"),
          api.get("/applications/statuses/"),
        ]);
        setApplications(applicationsResponse.data || []);
        setStatuses(statusesResponse.data || []);
      } catch (err) {
        const message = err.response?.data?.detail || "Failed to load applicants.";
        setError(message);
        showToast(message, "error");
      } finally {
        setPageLoading(false);
      }
    };

    if (!loading && auth.user && isApproved) {
      fetchApplicants();
    } else if (!loading) {
      setPageLoading(false);
    }
  }, [loading, auth.user, isApproved, showToast]);

  useEffect(() => {
    if (requestedStatusFilter) {
      setStatusFilter(requestedStatusFilter);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, navigate, requestedStatusFilter]);

  const statusLabel = (status) =>
    status?.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()) ||
    "Unknown";

  const uniqueJobs = useMemo(
    () => [
      "all",
      ...new Set(applications.map((application) => application.job_title).filter(Boolean)),
    ],
    [applications]
  );

  const filteredApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesQuery =
        !query ||
        application.applicant_name?.toLowerCase().includes(query) ||
        application.student_registration_no?.toLowerCase().includes(query) ||
        application.job_title?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "offers_extended"
          ? OFFER_STATUSES.includes(application.status)
          : application.status === statusFilter);
      const matchesJob = jobFilter === "all" || application.job_title === jobFilter;

      return matchesQuery && matchesStatus && matchesJob;
    });
  }, [applications, jobFilter, searchTerm, statusFilter]);

  const availableStatusOptions = useMemo(() => {
    const baseOptions = [
      "applied",
      "shortlisted",
      "offers_extended",
      "offered",
      "offer_accepted",
      "offer_declined",
      "rejected",
    ];
    const apiOptions = statuses
      .map((status) => status.code)
      .filter(Boolean);
    return [...new Set([...baseOptions, ...apiOptions])];
  }, [statuses]);

  const stats = useMemo(
    () => ({
      total: applications.length,
      shortlisted: applications.filter(
        (application) => application.status === "shortlisted"
      ).length,
      offered: applications.filter((application) =>
        OFFER_STATUSES.includes(application.status)
      ).length,
      accepted: applications.filter(
        (application) => application.status === "offer_accepted"
      ).length,
    }),
    [applications]
  );

  const handleStatusUpdate = async ({ applicationId, statusId, remarks }) => {
    if (!statusId) {
      const message = "Please choose a new status before updating.";
      setModalError(message);
      showToast(message, "error");
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
      showToast("Application status updated successfully.");
    } catch (err) {
      const message =
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to update application status.";
      setModalError(message);
      showToast(message, "error");
    } finally {
      setSavingId(null);
    }
  };

  if (loading || pageLoading) return <PageLoader />;
  if (!auth.user) return <p>User information is unavailable.</p>;
  if (!isApproved) {
    return (
      <>
        <CompanyNavbar Company={auth.user} />
        <RecruiterApprovalPending
          title="Applicant Review Unavailable"
          message="Your recruiter profile is currently under administrative review. Applicant review access will be enabled once your account has been approved."
        />
      </>
    );
  }

  return (
    <>
      <RecruiterToast toast={toast} modalOpen={Boolean(selectedApplication)} />
      <CompanyNavbar Company={auth.user} />
      <div className="va-page">
        <main className="va-container">
          <section className="va-hero">
            <div>
              <h1>Applicant Review</h1>
              <p>Review candidate profiles and assess applications efficiently from a single workspace.</p>
              {error && <p className="va-inline-message va-error">{error}</p>}
            </div>
            <button
              className="va-primary-btn"
              onClick={() => navigate("/Recruiter/Manage")}
            >
              Opening Management
            </button>
          </section>

          <section className="va-stats-grid">
            <div className="va-stat-card">
              <span className="va-stat-label">Total Applicants</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="va-stat-card">
              <span className="va-stat-label">Shortlisted</span>
              <strong>{stats.shortlisted}</strong>
            </div>
            <div className="va-stat-card">
              <span className="va-stat-label">Offers Extended</span>
              <strong>{stats.offered}</strong>
            </div>
            <div className="va-stat-card">
              <span className="va-stat-label">Offers Accepted</span>
              <strong>{stats.accepted}</strong>
            </div>
          </section>

          <section className="va-toolbar">
            <input
              className="va-search"
              type="text"
              placeholder="Search by applicant, registration number, or role..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <select
              className="va-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Statuses</option>
              {availableStatusOptions.map((statusCode) => (
                <option key={statusCode} value={statusCode}>
                  {statusLabel(statusCode)}
                </option>
              ))}
            </select>
            <select
              className="va-select"
              value={jobFilter}
              onChange={(event) => setJobFilter(event.target.value)}
            >
              {uniqueJobs.map((job) => (
                <option key={job} value={job}>
                  {job === "all" ? "All Positions" : job}
                </option>
              ))}
            </select>
          </section>

          <section className="va-list">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <article key={application.id} className="va-card va-card-compact">
                  <div className="va-card-summary">
                    <div>
                      <h2>{application.applicant_name || "Unnamed Applicant"}</h2>
                      <p className="va-subtitle">
                        {application.student_registration_no} {" • "} {application.job_title}
                      </p>
                    </div>
                    <span className={`va-status va-status-${application.status}`}>
                      {statusLabel(application.status)}
                    </span>
                  </div>
                  <button
                    className="va-primary-btn"
                    type="button"
                    onClick={() => {
                      setModalError("");
                      setSelectedApplication(application);
                    }}
                  >
                    Review Profile
                  </button>
                </article>
              ))
            ) : (
              <div className="va-empty">
                <h2>No applicants found</h2>
                <p>No applicants match the current filters. Adjust the search criteria or review applications later.</p>
              </div>
            )}
          </section>
        </main>
      </div>
      <RecruiterFooter />

      <ApplicantProfileModalEnhanced
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

export default RecruiterApplicantsPage;
