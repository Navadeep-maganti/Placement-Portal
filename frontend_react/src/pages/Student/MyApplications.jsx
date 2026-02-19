import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import StudentNavbar from '../../components/Navbar/StudentNavbar';
import '../../styles/css/MyApplications.css';

const MyApplications = () => {
  const { auth, loading } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const applications = [
    {
      id: 1,
      jobTitle: 'Senior Developer',
      company: 'Google',
      appliedDate: '2025-01-15',
      status: 'shortlisted',
      salary: '8-10 LPA',
      location: 'Bangalore',
      nextStep: 'Technical Interview - Feb 20'
    },
    {
      id: 2,
      jobTitle: 'Product Manager',
      company: 'Microsoft',
      appliedDate: '2025-01-10',
      status: 'pending',
      salary: '10-12 LPA',
      location: 'Pune',
      nextStep: 'Under Review'
    },
    {
      id: 3,
      jobTitle: 'Data Scientist',
      company: 'Amazon',
      appliedDate: '2025-01-05',
      status: 'rejected',
      salary: '7-9 LPA',
      location: 'Bangalore',
      nextStep: 'Application Rejected'
    },
    {
      id: 4,
      jobTitle: 'Frontend Engineer',
      company: 'Meta',
      appliedDate: '2025-01-12',
      status: 'selected',
      salary: '6-8 LPA',
      location: 'Delhi',
      nextStep: 'Offer Received'
    },
  ];

  if (loading) return <p>Loading...</p>;
  if (!auth.user) return <p>No user data</p>;

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'shortlisted': '#3b82f6',
      'selected': '#10b981',
      'rejected': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const filteredApplications = applications.filter(app => {
    return filterStatus === 'all' || app.status === filterStatus;
  }).sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.appliedDate) - new Date(a.appliedDate);
    if (sortBy === 'oldest') return new Date(a.appliedDate) - new Date(b.appliedDate);
    return 0;
  });

  return (
    <div className="ma-my-applications-page">
      <StudentNavbar student={auth.user} />
      
      <div className="ma-applications-container">
        <div className="ma-applications-header">
          <h1>My Applications</h1>
          <p>Track your job applications and interview status</p>
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
            <div className="ma-stat-number">{applications.filter(a => a.status === 'selected').length}</div>
            <div className="ma-stat-label">Selected</div>
          </div>
          <div className="ma-stat-card">
            <div className="ma-stat-number">{applications.filter(a => a.status === 'pending').length}</div>
            <div className="ma-stat-label">Pending</div>
          </div>
        </div>

        <div className="ma-filters-section">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="ma-filter-select">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="selected">Selected</option>
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
                    <h3>{app.jobTitle}</h3>
                    <p className="ma-company-name">{app.company}</p>
                  </div>
                  <span className="ma-status-badge" style={{ backgroundColor: getStatusColor(app.status) }}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>

                <div className="ma-app-details">
                  <span>{app.location}</span>
                  <span>{app.salary}</span>
                  <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                </div>

                <div className="ma-app-next-step">
                  <strong>Next Step:</strong> {app.nextStep}
                </div>

                <div className="ma-app-actions">
                  <button className="ma-view-btn">View Details</button>
                  <button className="ma-withdraw-btn">Withdraw</button>
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
  )
}

export default MyApplications