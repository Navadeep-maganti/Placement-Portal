import React from "react";
import "../../styles/css/CompanyDashboard.css";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import { useAuth } from "../../contexts/AuthContext";

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
            <div className="cd-overview-card cd-appliedRoles">
              <h4 className="cd-overview-title">Active Job Posts</h4>
              <p className="cd-overview-count">5</p>
            </div>
            <div className="cd-overview-card cd-bookmarkedRoles">
              <h4 className="cd-overview-title">Total Applicants</h4>
              <p className="cd-overview-count">256</p>
            </div>
            <div className="cd-overview-card cd-shortlisted">
              <h4 className="cd-overview-title">Shortlisted Students</h4>
              <p className="cd-overview-count">171</p>
            </div>
            <div className="cd-overview-card cd-offersRecieved">
              <h4 className="cd-overview-title">Scheduled Interviews</h4>
              <p className="cd-overview-count">3</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
export default companyDashboard;