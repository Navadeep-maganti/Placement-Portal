import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/css/Applications.css";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import PageLoader from "../../components/Common/PageLoader";
import RecruiterApprovalPending from "../../components/Recruiter/RecruiterApprovalPending";
import RecruiterToast from "../../components/Recruiter/RecruiterToast";
import { useAuth } from "../../contexts/AuthContext";
import useRecruiterToast from "../../hooks/useRecruiterToast";
import api from "../../utils/api";

function ViewApplicants(){
    const { auth, loading } = useAuth();
    const navigate = useNavigate();
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
                const message =
                    err.response?.data?.detail || "Failed to load applicants.";
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

    const statusLabel = (status) =>
        status
            ?.replaceAll("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase()) || "Unknown";

    const uniqueJobs = useMemo(() => {
        return [
            "all",
            ...new Set(applications.map((application) => application.job_title).filter(Boolean)),
        ];
    }, [applications]);

    const filteredApplications = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return applications.filter((application) => {
            const matchesQuery =
                !query ||
                application.applicant_name?.toLowerCase().includes(query) ||
                application.student_registration_no?.toLowerCase().includes(query) ||
                application.applicant_department?.toLowerCase().includes(query) ||
                application.job_title?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "all" || application.status === statusFilter;
            const matchesJob =
                jobFilter === "all" || application.job_title === jobFilter;

            return matchesQuery && matchesStatus && matchesJob;
        });
    }, [applications, jobFilter, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: applications.length,
            shortlisted: applications.filter((application) => application.status === "shortlisted").length,
            offered: applications.filter((application) => application.status === "offered").length,
            accepted: applications.filter((application) => application.status === "offer_accepted").length,
        };
    }, [applications]);

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
                <RecruiterApprovalPending />
            </>
        );
    }

    return(
        <>
            <RecruiterToast toast={toast} />
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
                        placeholder="Search by name, reg no, department, or role..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                    <select
                        className="va-select"
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
                            <article key={application.id} className="va-card">
                                <div className="va-card-header">
                                    <div>
                                        <h2>{application.applicant_name || "Unnamed Applicant"}</h2>
                                        <p className="va-subtitle">
                                            {application.student_registration_no} • {application.applicant_department || "Department N/A"}
                                        </p>
                                    </div>
                                    <span className={`va-status va-status-${application.status}`}>
                                        {statusLabel(application.status)}
                                    </span>
                                </div>

                                <div className="va-info-grid">
                                    <div>
                                        <span className="va-field-label">Position Applied For</span>
                                        <p>{application.job_title}</p>
                                    </div>
                                    <div>
                                        <span className="va-field-label">Applied On</span>
                                        <p>{new Date(application.application_date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <span className="va-field-label">Email</span>
                                        <p>{application.applicant_email || "Not provided"}</p>
                                    </div>
                                    <div>
                                        <span className="va-field-label">Phone</span>
                                        <p>{application.applicant_phone || "Not provided"}</p>
                                    </div>
                                    <div>
                                        <span className="va-field-label">CGPA</span>
                                        <p>{application.applicant_cgpa ?? "N/A"}</p>
                                    </div>
                                    <div>
                                        <span className="va-field-label">Backlogs</span>
                                        <p>{application.applicant_backlogs ?? 0}</p>
                                    </div>
                                    <div>
                                        <span className="va-field-label">Graduation Year</span>
                                        <p>{application.applicant_graduation_year || "N/A"}</p>
                                    </div>
                                    <div>
                                        <span className="va-field-label">Resume</span>
                                        {application.applicant_resume_url ? (
                                            <a
                                                href={application.applicant_resume_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="va-link"
                                            >
                                                {application.applicant_resume_name || "View Resume"}
                                            </a>
                                        ) : (
                                            <p>Not uploaded</p>
                                        )}
                                    </div>
                                </div>

                                <div className="va-section">
                                    <span className="va-field-label">Skills Summary</span>
                                    <p>{application.applicant_skills_summary || "No skills summary submitted."}</p>
                                </div>

                                <div className="va-section">
                                    <span className="va-field-label">Career Objective</span>
                                    <p>{application.applicant_career_objective || "No career objective submitted."}</p>
                                </div>

                                <div className="va-section">
                                    <span className="va-field-label">Bio</span>
                                    <p>{application.applicant_bio || "No bio submitted."}</p>
                                </div>

                                <div className="va-section">
                                    <span className="va-field-label">Latest Update</span>
                                    <p>
                                        {application.status_history?.[0]?.remarks ||
                                            `Application is currently ${statusLabel(application.status).toLowerCase()}.`}
                                    </p>
                                </div>
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
        </>
    )
}

export default ViewApplicants;
