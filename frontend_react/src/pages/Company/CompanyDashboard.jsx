import React from "react";
import "../../styles/css/CompanyDashboard.css";
function companyDashboard() {
    return (
        <div>
        <section className="cd-header">
          <div className="welcome-section">
            <h2>Welcome Back, Tech Innovators</h2>
            <p>Your hub for managing placements and connecting with top talent.</p>
            </div>
            <div className="cd-actions">
              <button className="cd-btn primary">Post New Role</button>
              <button className="cd-btn ghost">View Applicants</button>
            </div>
        </section>
        <section className="cd-main-div">
          <div className="cd-section-header">
            <h3>Current Placements</h3>
            <span className="cd-section-tag">Active this month</span>
            </div>
            <div className="placements-overview">
                <div className="placement-card">
                    <h4>Software Engineer Intern</h4>
                    <p>University of XYZ - 3 positions</p>
                    <div className="placement-meta">

                        <span>Deadline: Aug 30</span>
                        <span>Remote</span>
                    </div>
                </div>
                <div className="placement-card">
                    <h4>Data Analyst</h4>
                    <p>University of ABC - 2 positions</p>
                    <div className="placement-meta">
                        <span>Deadline: Sep 15</span>
                        <span>On-site</span>
                    </div>
                </div>
            </div>
        </section>

        <section className="cd-main-div">
            <div className="cd-section-header">
                <h3>Upcoming Drives</h3>
                <span className="cd-section-tag">Plan ahead</span>
            </div>
            <div className="upcoming-drives">
                <div className="drive-card">
                    <h4>Fall 2025 Drive</h4>
                    <p>Kickstart your recruitment season with our Fall Drive.</p>
                    <div className="drive-meta">
                        <span>Starts: Oct 1</span>
                        <span>Virtual</span>
                    </div>
                </div>
                <div className="drive-card">
                    <h4>Spring 2026 Drive</h4>
                    <p>Connect with emerging talent in our Spring Drive.</p>
                    <div className="drive-meta">
                        <span>Starts: Mar 1</span>
                        <span>Hybrid</span>
                    </div>
                </div>
            </div>
        </section>
        </div>
    );
}
    export default companyDashboard;