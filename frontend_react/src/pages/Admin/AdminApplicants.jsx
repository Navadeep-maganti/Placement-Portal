import React, { useState } from 'react';
import '../../styles/css/AdminApplicants.css';

const AdminApplicants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const applicants = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', job: 'Senior Developer', appliedDate: '2025-01-15', status: 'shortlisted' },
    { id: 2, name: 'Priya Singh', email: 'priya@example.com', job: 'Product Manager', appliedDate: '2025-01-14', status: 'pending' },
    { id: 3, name: 'Amit Patel', email: 'amit@example.com', job: 'Data Scientist', appliedDate: '2025-01-13', status: 'rejected' },
    { id: 4, name: 'Sarah Johnson', email: 'sarah@example.com', job: 'Frontend Developer', appliedDate: '2025-01-12', status: 'selected' },
    { id: 5, name: 'Vikram Desai', email: 'vikram@example.com', job: 'Backend Engineer', appliedDate: '2025-01-11', status: 'pending' },
  ];

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.job.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      shortlisted: '#3b82f6',
      selected: '#10b981',
      rejected: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="admin-applicants">
      <div className="applicants-header">
        <h1>Applications Management</h1>
        <p>Review and manage all job applications</p>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or job..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="applicants-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Applied For</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplicants.map((applicant) => (
              <tr key={applicant.id} className="table-row">
                <td className="name-cell">{applicant.name}</td>
                <td>{applicant.email}</td>
                <td>{applicant.job}</td>
                <td>{new Date(applicant.appliedDate).toLocaleDateString()}</td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: getStatusBadgeColor(applicant.status) }}>
                    {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="action-btn view-btn" title="View">👁</button>
                  <button className="action-btn edit-btn" title="Change Status">✏</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredApplicants.length === 0 && (
        <div className="no-results">
          <p>No applicants found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default AdminApplicants;
