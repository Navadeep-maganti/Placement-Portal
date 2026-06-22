import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/css/Post.css";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import PageLoader from "../../components/Common/PageLoader";
import RecruiterFooter from "../../components/Footer/RecruiterFooter";
import RecruiterApprovalPending from "../../components/Recruiter/RecruiterApprovalPending";
import RecruiterToast from "../../components/Recruiter/RecruiterToast";
import SkillPicker from "../../components/Common/SkillPicker";
import { useAuth } from "../../contexts/AuthContext";
import useRecruiterToast from "../../hooks/useRecruiterToast";
import {
  FiBriefcase,
  FiDollarSign,
  FiEdit2,
  FiFilter,
  FiHeadphones,
  FiTrash2,
} from "react-icons/fi";
import api from "../../utils/api";

const emptyForm = {
  title: "",
  description: "",
  salary: "",
  cgpa: "",
  deadline: "",
  positions: "",
  requiredSkills: [],
};

function RecruiterPostingsPage() {
  const { auth, loading } = useAuth();
  const isApproved = Boolean(auth.user?.is_approved);
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyForm);
  const [deadlineError, setDeadlineError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [postings, setPostings] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillLoading, setSkillLoading] = useState(true);
  const [addingSkill, setAddingSkill] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const formRef = useRef(null);
  const titleInputRef = useRef(null);
  const { toast, showToast } = useRecruiterToast();

  const scrollToEditForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    titleInputRef.current?.focus();
  };

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

  const fetchPostings = async () => {
    const response = await api.get("/placements/my-postings/");
    setPostings(response.data || []);
  };

  const fetchSkills = async () => {
    const response = await api.get("/placements/skills/");
    setAvailableSkills(response.data || []);
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        setError("");
        await Promise.all([fetchPostings(), fetchSkills()]);
      } catch (err) {
        const message =
          err.response?.data?.detail || "Failed to load your job listings.";
        setError(message);
        showToast(message, "error");
      } finally {
        setPageLoading(false);
        setSkillLoading(false);
      }
    };

    if (!loading && auth.user && isApproved) {
      loadPage();
    } else if (!loading) {
      setPageLoading(false);
      setSkillLoading(false);
    }
  }, [loading, auth.user, isApproved, showToast]);

  useEffect(() => {
    const posting = location.state?.editPosting;
    if (!posting) {
      return;
    }

    setEditingId(posting.id);
    setFormData({
      title: posting.job_title || "",
      description: posting.job_description || "",
      salary: posting.salary || "",
      cgpa:
        posting.eligibility_details?.min_cgpa ||
        posting.eligibility_cgpa ||
        "",
      deadline: posting.application_deadline || "",
      positions: posting.no_of_positions || "",
      requiredSkills: posting.required_skill_names || [],
    });
    requestAnimationFrame(scrollToEditForm);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "salary" ? value.replace(/[^\d.]/g, "") : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (name === "deadline" && deadlineError) {
      setDeadlineError("");
    }
  };

  const toggleSkillSelection = (skillName) => {
    setFormData((prev) => {
      const exists = prev.requiredSkills.includes(skillName);
      return {
        ...prev,
        requiredSkills: exists
          ? prev.requiredSkills.filter((item) => item !== skillName)
          : [...prev.requiredSkills, skillName],
      };
    });
  };

  const removeSelectedSkill = (skillName) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((item) => item !== skillName),
    }));
    showToast(`Removed "${skillName}" from required skills.`);
  };

  const handleAddSkill = async (skillName) => {
    const trimmedName = skillName.trim();
    if (!trimmedName) {
      showToast("Enter a skill name before adding it.", "error");
      return false;
    }

    try {
      setAddingSkill(true);
      const response = await api.post("/placements/skills/", { name: trimmedName });
      const createdSkill = response.data;
      setAvailableSkills((prev) => {
        const exists = prev.some(
          (skill) => skill.name.toLowerCase() === createdSkill.name.toLowerCase()
        );
        if (exists) {
          return prev;
        }
        return [...prev, createdSkill].sort((a, b) => a.name.localeCompare(b.name));
      });
      setFormData((prev) => {
        const exists = prev.requiredSkills.some(
          (skill) => skill.toLowerCase() === createdSkill.name.toLowerCase()
        );
        return exists
          ? prev
          : { ...prev, requiredSkills: [...prev.requiredSkills, createdSkill.name] };
      });
      showToast(`Skill "${createdSkill.name}" selected successfully.`);
      return true;
    } catch (err) {
      const message = err.response?.data?.name?.[0] || "Failed to add the skill.";
      showToast(message, "error");
      return false;
    } finally {
      setAddingSkill(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setDeadlineError("");
  };

  const buildPayload = () => ({
    job_title: formData.title,
    job_description: formData.description,
    salary: Number(formData.salary || 0),
    eligibility_cgpa: formData.cgpa || 0,
    application_deadline: formData.deadline,
    is_active: true,
    no_of_positions: formData.positions || 1,
    skill_names: formData.requiredSkills,
    eligibility_details: {
      min_cgpa: Number(formData.cgpa || 0),
    },
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!formData.deadline) {
      setDeadlineError("Please select an application deadline.");
      showToast("Please select an application deadline.", "error");
      return;
    }

    if (formData.deadline < minDeadlineDate) {
      setDeadlineError("Application deadline must be at least 7 days after posting date.");
      showToast("Application deadline must be at least 7 days after posting date.", "error");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setFeedback("");
      const payload = buildPayload();
      if (editingId) {
        await api.patch(`/placements/my-postings/${editingId}/`, payload);
        setFeedback("Job listing updated successfully.");
        showToast("Job listing updated successfully.");
      } else {
        await api.post("/placements/my-postings/", payload);
        setFeedback("Job listing created successfully.");
        showToast("Job listing posted successfully.");
      }
      await fetchPostings();
      resetForm();
    } catch (err) {
      const message =
        err.response?.data?.detail || "Failed to save the job listing.";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (posting) => {
    setEditingId(posting.id);
    setFormData({
      title: posting.job_title || "",
      description: posting.job_description || "",
      salary: posting.salary || "",
      cgpa: posting.eligibility_details?.min_cgpa || posting.eligibility_cgpa || "",
      deadline: posting.application_deadline || "",
      positions: posting.no_of_positions || "",
      requiredSkills: posting.required_skill_names || [],
    });
    setFeedback("");
    setError("");
    showToast(`Editing "${posting.job_title}".`);
    requestAnimationFrame(scrollToEditForm);
  };

  const handleDelete = async (postingId) => {
    try {
      setDeletingId(postingId);
      setError("");
      setFeedback("");
      await api.delete(`/placements/my-postings/${postingId}/`);
      setPostings((prev) => prev.filter((posting) => posting.id !== postingId));
      if (editingId === postingId) {
        resetForm();
      }
      setFeedback("Job listing deleted successfully.");
      showToast("Job listing deleted successfully.");
    } catch (err) {
      const message =
        err.response?.data?.detail || "Failed to delete the job listing.";
      setError(message);
      showToast(message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || pageLoading) return <PageLoader />;
  if (!auth.user) return <p>User information is unavailable.</p>;
  if (!isApproved) {
    return (
      <>
        <CompanyNavbar Company={auth.user} />
        <RecruiterApprovalPending
          title="Job Listings Unavailable"
          message="Your recruiter profile is currently under administrative review. Access to job listing creation and management will be enabled once your account has been approved."
        />
      </>
    );
  }

  return (
    <>
      <RecruiterToast toast={toast} />
      <CompanyNavbar Company={auth.user} />
      <main className="mp-page">
        <section className="mp-header">
          <h1>{editingId ? "Edit Job Listing" : "Create Job Listing"}</h1>
          <p>Create, update, and manage the positions your organization is actively hiring for.</p>
          {error && <p className="mp-field-error">{error}</p>}
          {feedback && <p className="mp-feedback">{feedback}</p>}
        </section>

        <form className="mp-form-card" onSubmit={onSubmit} ref={formRef}>
          <section className="mp-form-section">
            <h2>
              <FiBriefcase size={16} />
              Job Information
            </h2>

            <label htmlFor="title">Job Title</label>
            <input id="title" name="title" type="text" value={formData.title} onChange={onFieldChange} ref={titleInputRef} />

            <label htmlFor="description">Job Description</label>
            <textarea id="description" name="description" rows="5" value={formData.description} onChange={onFieldChange} />
          </section>

          <section className="mp-form-section">
            <h2>
              <FiDollarSign size={16} />
              Requirements & Compensation
            </h2>
            <div className="mp-grid-two">
              <div>
                <label htmlFor="salary">Salary (LPA)</label>
                <input id="salary" name="salary" type="number" step="0.1" min="0" placeholder="e.g. 14.2" value={formData.salary} onChange={onFieldChange} />
              </div>
              <div>
                <label htmlFor="cgpa">Minimum CGPA</label>
                <input id="cgpa" name="cgpa" type="number" step="0.1" value={formData.cgpa} onChange={onFieldChange} />
              </div>
              <div>
                <label htmlFor="deadline">Application Deadline</label>
                <input id="deadline" name="deadline" type="date" min={minDeadlineDate} value={formData.deadline} onChange={onFieldChange} />
                {deadlineError && <p className="mp-field-error">{deadlineError}</p>}
              </div>
              <div>
                <label htmlFor="positions">Number of Positions</label>
                <input id="positions" name="positions" type="number" value={formData.positions} onChange={onFieldChange} />
              </div>
            </div>
          </section>

          <section className="mp-form-section">
            <h2>Required Skills</h2>
            <SkillPicker
              availableSkills={availableSkills}
              selectedSkills={formData.requiredSkills}
              onToggleSkill={toggleSkillSelection}
              onRemoveSkill={removeSelectedSkill}
              onAddSkill={handleAddSkill}
              loading={skillLoading}
              adding={addingSkill}
              helpText="Search available skills, tap to select them, or add a new skill if it is missing."
              searchPlaceholder="Search or add a required skill"
              emptyMessage="No skills available yet. Add the first one here."
            />
          </section>

          <div className="mp-actions">
            <button className="mp-btn mp-btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Listing" : "Publish Listing"}
            </button>
            <button className="mp-btn mp-btn-ghost" type="button" onClick={resetForm}>
              {editingId ? "Cancel Editing" : "Clear Form"}
            </button>
          </div>
        </form>

        <section className="mp-postings-panel">
          <div className="mp-panel-header">
            <h2>Your Job Listings</h2>
            <span>{postings.length} total</span>
          </div>
          <div className="mp-postings-list">
            {postings.length > 0 ? (
              postings.map((posting) => (
                <article key={posting.id} className="mp-posting-card">
                  <div className="mp-posting-head">
                    <div>
                      <h3>{posting.job_title}</h3>
                      <p>{posting.company_name}</p>
                    </div>
                    <span className={`mp-posting-status ${posting.is_active ? "active" : "inactive"}`}>
                      {posting.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mp-posting-meta">
                    <span>{posting.salary_lpa || posting.salary}</span>
                    <span>CGPA {posting.eligibility_details?.min_cgpa ?? posting.eligibility_cgpa}</span>
                    <span>Deadline {new Date(posting.application_deadline).toLocaleDateString()}</span>
                    <span>{posting.no_of_positions} positions</span>
                  </div>
                  <div className="mp-posting-skills">
                    {(posting.required_skill_names?.length ? posting.required_skill_names : ["No skills specified"]).map((skill) => (
                      <span key={skill} className="mp-skill-chip">{skill}</span>
                    ))}
                  </div>
                  <div className="mp-posting-actions">
                    <button className="mp-icon-btn" type="button" onClick={() => handleEdit(posting)}>
                      <FiEdit2 size={16} /> Edit
                    </button>
                    <button
                      className="mp-icon-btn danger"
                      type="button"
                      disabled={deletingId === posting.id}
                      onClick={() => handleDelete(posting.id)}
                    >
                      <FiTrash2 size={16} /> {deletingId === posting.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="mp-empty-state">
                <p>No job listings are available yet. Published roles will appear here once they are created.</p>
              </div>
            )}
          </div>
        </section>

        <section className="mp-benefits">
          <article className="mp-benefit-card">
            <span className="mp-benefit-icon">
              <FiBriefcase size={15} />
            </span>
            <h3>Instant Visibility</h3>
            <p>Your job becomes visible to relevant students as soon as it is published.</p>
          </article>
          <article className="mp-benefit-card">
            <span className="mp-benefit-icon">
              <FiFilter size={15} />
            </span>
            <h3>Auto Filtering</h3>
            <p>Minimum CGPA is applied consistently across every submitted application.</p>
          </article>
          <article className="mp-benefit-card">
            <span className="mp-benefit-icon">
              <FiHeadphones size={15} />
            </span>
            <h3>Recruiter Support</h3>
            <p>Manage job listings, review candidates, and oversee your hiring pipeline from one place.</p>
          </article>
        </section>
      </main>
      <RecruiterFooter />
    </>
  );
}

export default RecruiterPostingsPage;
