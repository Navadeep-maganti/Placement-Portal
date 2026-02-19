import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../../styles/css/AdminDashboard.css';

const AdminDashboard = () => {
  const jobsData = [
    { name: 'Active', value: 12, color: '#10b981' },
    { name: 'Closed', value: 8, color: '#ef4444' },
    { name: 'Draft', value: 3, color: '#f59e0b' }
  ];

  const placementData = [
    { month: 'Jan', placed: 45, applied: 120 },
    { month: 'Feb', placed: 52, applied: 135 },
    { month: 'Mar', placed: 38, applied: 110 },
    { month: 'Apr', placed: 61, applied: 145 },
    { month: 'May', placed: 55, applied: 130 },
    { month: 'Jun', placed: 48, applied: 125 }
  ];

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of placement portal statistics</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#dbeafe' }}>📊</div>
          <div className="metric-content">
            <h3>23</h3>
            <p>Total Jobs Posted</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#e0e7ff' }}>👥</div>
          <div className="metric-content">
            <h3>1,245</h3>
            <p>Total Applicants</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#dcfce7' }}>✓</div>
          <div className="metric-content">
            <h3>456</h3>
            <p>Students Placed</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#fef3c7' }}>📈</div>
          <div className="metric-content">
            <h3>36.6%</h3>
            <p>Placement Rate</p>
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h2>Jobs Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={jobsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {jobsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Placement Trends (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={placementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="placed" fill="#10b981" />
              <Bar dataKey="applied" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="activities-section">
        <h2>Recent Activities</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-indicator" style={{ backgroundColor: '#10b981' }}></div>
            <div className="activity-content">
              <p className="activity-title">New Job Posted: Senior Developer</p>
              <p className="activity-time">2 hours ago</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-indicator" style={{ backgroundColor: '#3b82f6' }}></div>
            <div className="activity-content">
              <p className="activity-title">Student Placed - Rajesh Kumar</p>
              <p className="activity-time">5 hours ago</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-indicator" style={{ backgroundColor: '#f59e0b' }}></div>
            <div className="activity-content">
              <p className="activity-title">21 New Applications Received</p>
              <p className="activity-time">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;