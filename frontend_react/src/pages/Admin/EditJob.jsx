import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/css/AdminJobCreate.css';

const EditJob = () => {
  const { jobId } = useParams();
  const [formData, setFormData] = useState({
    title: 'Senior Developer',
    company: 'Tech Corp',
    salary: '8-10 LPA',
    location: 'Bangalore',
    experience: '2-3 years',
    jobType: 'full-time',
    description: 'We are looking for an experienced senior developer...',
    requirements: 'Strong knowledge of React, Node.js, and databases',
    ctc: '900000',
    deadline: '2025-02-15',
    status: 'active',
    applicants: 24
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    console.log('Form Updated:', formData);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="job-create-page">
      <div className="create-header">
        <h1>Edit Job Opening</h1>
        <p>Update job details and posting information</p>
      </div>

      <div className="job-status-info">
        <div className="status-item">
          <span className="status-label">Current Status:</span>
          <span className="status-badge" style={{ backgroundColor: '#10b981' }}>Active</span>
        </div>
        <div className="status-item">
          <span className="status-label">Total Applicants:</span>
          <span className="applicants-count">24</span>
        </div>
      </div>

      <form className="job-form" onSubmit={handleSubmit}>
        <fieldset className="form-section">
          <legend>Basic Information</legend>
          
          <div className="form-row">
            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Job Type *</label>
              <select name="jobType" value={formData.jobType} onChange={handleChange}>
                <option value="full-time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Compensation & Experience</legend>
          
          <div className="form-row">
            <div className="form-group">
              <label>CTC (Rs per annum) *</label>
              <input
                type="number"
                name="ctc"
                value={formData.ctc}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Salary Range *</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Experience Required *</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Job Details</legend>
          
          <div className="form-group">
            <label>Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              required
            />
          </div>

          <div className="form-group">
            <label>Requirements / Skills *</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="5"
              required
            />
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Additional Information</legend>
          
          <div className="form-group">
            <label>Application Deadline *</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>
        </fieldset>

        {submitted && (
          <div className="success-message">Job posting updated successfully!</div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;