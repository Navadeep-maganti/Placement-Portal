import React, { useState } from 'react'
import StudentNavbar from '../../components/Navbar/StudentNavbar'
import { useAuth } from '../../contexts/AuthContext'
import { useParams } from 'react-router-dom'
import '../../styles/css/JobDetails.css'

const JobDetails = () => {
  const { jobId } = useParams();
  const { auth, loading } = useAuth();
  const [isApplied, setIsApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const job = {
    id: jobId || 1,
    title: 'Senior Product Engineer',
    company: 'Google',
    location: 'Bangalore',
    salary: '8-10 LPA',
    ctc: '9 LPA',
    type: 'Full-time',
    experience: '2-3 years',
    skills: ['React', 'Node.js', 'Python', 'AWS', 'SQL'],
    logo: 'G',
    description: 'We are looking for a talented Senior Product Engineer to join our growing team.',
    responsibilities: [
      'Design and develop scalable web applications using React and Node.js',
      'Collaborate with cross-functional teams to build amazing products',
      'Mentoring junior developers and code reviews',
      'Contributing to system design and architecture discussions',
      'Optimizing application performance and security'
    ],
    qualifications: [
      '2+ years of professional experience in software development',
      'Strong proficiency in JavaScript/TypeScript',
      'Experience with React or similar frameworks',
      'Understanding of databases and APIs',
      'Excellent problem-solving skills',
      'Bachelor degree in Computer Science or related field'
    ],
    benefits: [
      'Competitive salary and equity',
      'Health insurance for you and family',
      'Flexible work arrangements',
      'Professional development opportunities',
      'Free meals and beverages',
      'Collaborative work environment'
    ],
    deadline: '2025-02-15',
    applications: 45,
    posted: '2025-01-20'
  };

  if (loading) return <p>Loading...</p>;
  if (!auth.user) return <p>Please log in to view job details</p>;

  const handleApply = () => {
    setIsApplied(true);
    alert('Application submitted successfully!');
  };

  return (
    <div className="job-details-page">
      <StudentNavbar student={auth.user} />

      <div className="job-details-container">
        <div className="job-header-section">
          <div className="job-header-content">
            <div className="job-title-block">
              <div className="company-logo">{job.logo}</div>
              <div>
                <h1>{job.title}</h1>
                <p className="company-name">{job.company}</p>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
            </div>
          </div>

          <div className="quick-info">
            <div className="info-item">
              <span className="info-label">Salary</span>
              <span className="info-value">{job.salary} (CTC: {job.ctc})</span>
            </div>
            <div className="info-item">
              <span className="info-label">Location</span>
              <span className="info-value">{job.location}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Experience</span>
              <span className="info-value">{job.experience}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Type</span>
              <span className="info-value">{job.type}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Deadline</span>
              <span className="info-value">{job.deadline}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Applications</span>
              <span className="info-value">{job.applications}</span>
            </div>
          </div>
        </div>

        <div className="job-content">
          <div className="apply-section">
            <button 
              className={`apply-btn-large ${isApplied ? 'applied' : ''}`}
              onClick={handleApply}
              disabled={isApplied}
            >
              {isApplied ? 'Applied' : 'Apply Now'}
            </button>
            {isApplied && <p className="applied-message">You have successfully applied for this position!</p>}
          </div>

          <section className="job-section">
            <h2>About This Role</h2>
            <p>{job.description}</p>
          </section>

          <section className="job-section">
            <h2>What You Will Do</h2>
            <ul className="job-list">
              {job.responsibilities.map((resp, idx) => (
                <li key={idx}>{resp}</li>
              ))}
            </ul>
          </section>

          <section className="job-section">
            <h2>What We Are Looking For</h2>
            <ul className="job-list">
              {job.qualifications.map((qual, idx) => (
                <li key={idx}>{qual}</li>
              ))}
            </ul>
          </section>

          <section className="job-section">
            <h2>Required Skills</h2>
            <div className="skills-container">
              {job.skills.map((skill, idx) => (
                <span key={idx} className="skill-badge">{skill}</span>
              ))}
            </div>
          </section>

          <section className="job-section">
            <h2>Why Join Us</h2>
            <div className="benefits-grid">
              {job.benefits.map((benefit, idx) => (
                <div key={idx} className="benefit-item">
                  <span className="benefit-icon">CHECK</span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <StudentFooter />
    </div>
  )
}

export default JobDetails