import React from "react";
import "../../styles/css/CompanyDashboard.css";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import { useAuth } from "../../contexts/AuthContext";
import { FiBriefcase, FiUsers, FiUserCheck, FiCalendar } from "react-icons/fi";

function companyDashboard() {
  const { auth, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!auth.user) return <p>No user data</p>;
  return (
    <>
      <CompanyNavbar Company={auth.user} />
      <div className="Company-Dashboard-body">

        <section className="cd-hero">
          <div className="cd-hero-text">
            <h2>Welcome, {auth.user.first_name}! &#128075;</h2>
            <p className="cd-subtitle">
              Here's what's happening with your recruitment cycle today.
            </p>
          </div>
          <div className="cd-posting">
            <button className="cd-btn"> + post new job</button>
          </div>

        </section>

        <section className="cd-main-div">
          <div className="cd-section-header">
            <h3>Placement Overview</h3>
            <span className="cd-section-tag">This month</span>
          </div>
          <div className="cd-overview-div">
            <div className="cd-overview-card cd-active-job-posts">
              <div className="cd-overview-head">
                <span className="cd-overview-icon">
                  <FiBriefcase size={18} />
                </span>
                <h4 className="cd-overview-title">Active Job Posts</h4>
              </div>

              <p className="cd-overview-count">5</p>
            </div>
            <div className="cd-overview-card cd-total-applicants">
              <div className="cd-overview-head">
                <span className="cd-overview-icon">
                  <FiUsers size={18} />
                </span>
                <h4 className="cd-overview-title">Total Applicants</h4>
              </div>
              <p className="cd-overview-count">256</p>
            </div>
            <div className="cd-overview-card cd-shortlisted-students">
              <div className="cd-overview-head">
                <span className="cd-overview-icon">
                  <FiUserCheck size={18} />
                </span>
                <h4 className="cd-overview-title">Shortlisted Students</h4>
              </div>
              <p className="cd-overview-count">171</p>
            </div>
            <div className="cd-overview-card cd-scheduled-interviews">
              <div className="cd-overview-head">
                <span className="cd-overview-icon">
                  <FiCalendar size={18} />
                </span>
                <h4 className="cd-overview-title">Scheduled Interviews</h4>
              </div>
              <p className="cd-overview-count">3</p>
            </div>
          </div>
        </section>

        <section className="cd-recent-activity">
          <div className="cd-section-header">
            <h3>Recent Activity</h3>
            <button className="cd-btn">View all applicants</button>
          </div>
          <div className="cd-activity-feed">
            <div className="cd-activity-item">
              <p><strong>John Doe</strong> applied for <strong>Software Engineer</strong>.</p>
              <div className="cd-view-applicant">
                <span className="cd-activity-time">2 hours ago</span>
                <button className="cd-view-profile">View Profile</button>
              </div>
            </div>
            <div className="cd-activity-item">
              <p><strong>Jane Smith</strong> was shortlisted for <strong>Data Analyst</strong>.</p>
              <div className="cd-view-applicant">
                <span className="cd-activity-time">5 hours ago</span>
                <button className="cd-view-profile">View Profile</button>
              </div>
            </div>
            <div className="cd-activity-item">
              <p><strong>Michael Brown</strong> scheduled an interview for <strong>Product Manager</strong>.</p>
              <div className="cd-view-applicant">
                <span className="cd-activity-time">1 day ago</span>
                <button className="cd-view-profile">View Profile</button>
              </div>
            </div>
          </div>
        </section>

        <footer className="cd-footer">
          <p>@2026 Placement Portal NIT AP. All rights reserved.</p>
        </footer>

      </div>
    </>
  );
}
export default companyDashboard;
