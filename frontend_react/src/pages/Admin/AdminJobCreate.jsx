import React, { useState } from 'react';
import '../../styles/css/AdminJobCreate.css';

const AdminJobCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    salary: '',
    location: '',
    experience: '',
    jobType: 'full-time',
    description: '',
    requirements: '',
    ctc: '',
    deadline: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    console.log('Form Submitted:', formData);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="job-create-page">
      <div className="create-header">
        <h1>Create New Job Opening</h1>
        <p>Post a new job opportunity for students</p>
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
                placeholder="e.g., Senior Software Engineer"
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
                placeholder="e.g., Google, Microsoft"
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
                placeholder="e.g., Bangalore, India"
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
                placeholder="e.g., 800000"
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
                placeholder="e.g., 8-10 LPA"
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
                placeholder="e.g., 0-2 years"
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
              placeholder="Describe the job role, responsibilities, and what we're looking for..."
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
              placeholder="List required skills, qualifications, and technical knowledge..."
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
          <div className="success-message">Job posting created successfully!</div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary">Save as Draft</button>
          <button type="submit" className="btn-primary">Publish Job</button>
        </div>
      </form>
    </div>
  );
};

export default AdminJobCreate;