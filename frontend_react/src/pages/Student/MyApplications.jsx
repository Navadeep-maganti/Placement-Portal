import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import StudentNavbar from "../../components/Navbar/StudentNavbar";
import api from "../../utils/api";
import "../../styles/css/MyApplications.css";

const MyApplications = () => {
  const { auth, loading } = useAuth();
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [applications, setApplications] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <p>Loading...</p>;
  if (!auth.user) return <p>No user data</p>;
  if (pageLoading) return <p>Loading applications...</p>;

  const getStatusColor = (status) => {
    const colors = {
      applied: "#f59e0b",
      shortlisted: "#3b82f6",
      offered: "#10b981",
      rejected: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const filteredApplications = applications
    .filter((app) => {
    return filterStatus === 'all' || app.status === filterStatus;
    })
    .sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.application_date) - new Date(a.application_date);
    }
    if (sortBy === "oldest") {
      return new Date(a.application_date) - new Date(b.application_date);
    }
    return 0;
  });

  return (
    <div className="ma-my-applications-page">
      <StudentNavbar student={auth.user} />
      
      <div className="ma-applications-container">
        <div className="ma-applications-header">
          <h1>My Applications</h1>
          <p>Track your job applications and interview status</p>
          {error && <p>{error}</p>}
        </div>

        <div className="ma-stats-cards">
          <div className="ma-stat-card">
            <div className="ma-stat-number">{applications.length}</div>
            <div className="ma-stat-label">Total Applied</div>
          </div>
          <div className="ma-stat-card">
            <div className="ma-stat-number">{applications.filter(a => a.status === 'shortlisted').length}</div>
            <div className="ma-stat-label">Shortlisted</div>
          </div>
          <div className="ma-stat-card">
            <div className="ma-stat-number">{applications.filter(a => a.status === 'offered').length}</div>
            <div className="ma-stat-label">Offered</div>
          </div>
          <div className="ma-stat-card">
            <div className="ma-stat-number">{applications.filter(a => a.status === 'applied').length}</div>
            <div className="ma-stat-label">Applied</div>
          </div>
        </div>

        <div className="ma-filters-section">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="ma-filter-select">
            <option value="all">All Status</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="ma-filter-select">
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <div className="ma-applications-list">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app) => (
              <div key={app.id} className="ma-application-card">
                <div className="ma-app-header">
                  <div className="ma-app-title-section">
                    <h3>{app.job_title}</h3>
                    <p className="ma-company-name">Application #{app.id}</p>
                  </div>
                  <span className="ma-status-badge" style={{ backgroundColor: getStatusColor(app.status) }}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>

                <div className="ma-app-details">
                  <span>Reg No: {app.student_registration_no}</span>
                  <span>{new Date(app.application_date).toLocaleDateString()}</span>
                </div>

                <div className="ma-app-next-step">
                  <strong>Status:</strong> {app.status}
                </div>
              </div>
            ))
          ) : (
            <div className="ma-no-applications">
              <p>No applications found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
