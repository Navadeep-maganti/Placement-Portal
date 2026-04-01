import "../../styles/css/Post.css"
import React, { useMemo, useState } from "react";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import PageLoader from "../../components/Common/PageLoader";
import { useAuth } from "../../contexts/AuthContext";
import { FiBriefcase, FiDollarSign, FiFilter, FiHeadphones } from "react-icons/fi";

function MyPostings() {
  const { auth, loading } = useAuth();
  const toDateInputValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const minDeadlineDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return toDateInputValue(date);
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    salary: "",
    cgpa: "",
    deadline: "",
    positions: "",
    requiredSkills: "",
  });
  const [deadlineError, setDeadlineError] = useState("");

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "deadline" && deadlineError) {
      setDeadlineError("");
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();

    if (!formData.deadline) {
      setDeadlineError("Please select an application deadline.");
      return;
    }

    if (formData.deadline < minDeadlineDate) {
      setDeadlineError("Application deadline must be at least 7 days after posting date.");
      return;
    }

    setDeadlineError("");
  };

  if (loading) return <PageLoader />;
  if (!auth.user) return <p>User information is unavailable.</p>;

  return (
    <>
      <CompanyNavbar Company={auth.user} />
      <main className="mp-page">
        <section className="mp-header">
          <h1>Create Job Listing</h1>
          <p>Create a new opportunity and present the role professionally to prospective candidates.</p>
        </section>

        <form className="mp-form-card" onSubmit={onSubmit}>
          <section className="mp-form-section">
            <h2>
              <FiBriefcase size={16} />
              Job Information
            </h2>

            <label htmlFor="title">Job Title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Senior Software Engineer - Cloud Infrastructure"
              value={formData.title}
              onChange={onFieldChange}
            />

            <label htmlFor="description">Job Description</label>
            <textarea
              id="description"
              name="description"
              rows="5"
              placeholder="Outline the roles, responsibilities, and specific requirements for this position."
              value={formData.description}
              onChange={onFieldChange}
            />
          </section>

          <section className="mp-form-section">
            <h2>
              <FiDollarSign size={16} />
              Requirements & Compensation
            </h2>
            <div className="mp-grid-two">
              <div>
                <label htmlFor="salary">Salary (Annual)</label>
                <input
                  id="salary"
                  name="salary"
                  type="number"
                  placeholder="e.g. 120000"
                  value={formData.salary}
                  onChange={onFieldChange}
                />
              </div>
              <div>
                <label htmlFor="cgpa">Minimum CGPA</label>
                <input
                  id="cgpa"
                  name="cgpa"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 7.5"
                  value={formData.cgpa}
                  onChange={onFieldChange}
                />
              </div>
              <div>
                <label htmlFor="deadline">Application Deadline</label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  min={minDeadlineDate}
                  value={formData.deadline}
                  onChange={onFieldChange}
                />
                {deadlineError && <p className="mp-field-error">{deadlineError}</p>}
              </div>
              <div>
                <label htmlFor="positions">Number of Positions</label>
                <input
                  id="positions"
                  name="positions"
                  type="number"
                  placeholder="e.g. 5"
                  value={formData.positions}
                  onChange={onFieldChange}
                />
              </div>
            </div>
          </section>

          <section className="mp-form-section">
            <h2>Required Skills</h2>
            <input
              name="requiredSkills"
              type="text"
              placeholder="e.g. Python, React, Node.js"
              value={formData.requiredSkills}
              onChange={onFieldChange}
            />
          </section>

          <div className="mp-actions">
            <button className="mp-btn mp-btn-primary" type="submit">
              Publish Listing
            </button>
            <button className="mp-btn mp-btn-ghost" type="button">
              Clear Form
            </button>
          </div>
        </form>

        <section className="mp-benefits">
          <article className="mp-benefit-card">
            <span className="mp-benefit-icon">
              <FiBriefcase size={15} />
            </span>
            <h3>Instant Visibility</h3>
            <p>Your job listing will be visible to eligible students as soon as it is published.</p>
          </article>
          <article className="mp-benefit-card">
            <span className="mp-benefit-icon">
              <FiFilter size={15} />
            </span>
            <h3>Auto Filtering</h3>
            <p>Applications below the defined CGPA requirement are filtered automatically.</p>
          </article>
          <article className="mp-benefit-card">
            <span className="mp-benefit-icon">
              <FiHeadphones size={15} />
            </span>
            <h3>Recruiter Support</h3>
            <p>Our campus placement team is available to support your recruitment process when needed.</p>
          </article>
        </section>
      </main>
    </>
  );
}

export default MyPostings;
