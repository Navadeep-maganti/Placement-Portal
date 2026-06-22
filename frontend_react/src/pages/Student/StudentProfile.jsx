import React, { useEffect, useMemo, useState } from "react";
import StudentNavbar from "../../components/Navbar/StudentNavbar";
import StudentFooter from "../../components/Footer/StudentFooter";
import ChangePasswordModal from "../../components/Common/ChangePasswordModal";
import PageLoader from "../../components/Common/PageLoader";
import SkillPicker from "../../components/Common/SkillPicker";
import RecruiterToast from "../../components/Recruiter/RecruiterToast";
import { useAuth } from "../../contexts/AuthContext";
import useRecruiterToast from "../../hooks/useRecruiterToast";
import api from "../../utils/api";
import "../../styles/css/StudentProfile.css";

const BACKEND_ORIGIN = "http://127.0.0.1:8000";

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  registration_no: "",
  department: "",
  graduation_year: "",
  cgpa: "",
  active_backlogs: "",
  linkedin_url: "",
  portfolio_url: "",
  career_objective: "",
  skill_names: [],
  skills_summary: "",
  bio: "",
};

function StudentProfile() {
  const { auth, loading, refreshUser } = useAuth();
  const [formData, setFormData] = useState(emptyForm);
  const [resumeFile, setResumeFile] = useState(null);
  const [removeResume, setRemoveResume] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillLoading, setSkillLoading] = useState(true);
  const [addingSkill, setAddingSkill] = useState(false);
  const { toast, showToast } = useRecruiterToast();

  useEffect(() => {
    if (!auth.user) {
      return;
    }

    setFormData({
      first_name: auth.user.first_name || "",
      last_name: auth.user.last_name || "",
      email: auth.user.email || "",
      phone: auth.user.phone || "",
      registration_no: auth.user.registration_no || "",
      department: auth.user.department || "",
      graduation_year: auth.user.graduation_year || "",
      cgpa: auth.user.cgpa ?? "",
      active_backlogs: auth.user.active_backlogs ?? 0,
      linkedin_url: auth.user.linkedin_url || "",
      portfolio_url: auth.user.portfolio_url || "",
      career_objective: auth.user.career_objective || "",
      skill_names: auth.user.skill_names || [],
      skills_summary: auth.user.skills_summary || "",
      bio: auth.user.bio || "",
    });
    setResumeFile(null);
    setRemoveResume(false);
  }, [auth.user]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await api.get("/placements/skills/");
        setAvailableSkills(response.data || []);
      } catch (err) {
        showToast(
          err.response?.data?.detail ||
            "Failed to load skills. You can still edit the rest of your profile.",
          "error"
        );
      } finally {
        setSkillLoading(false);
      }
    };

    if (!loading && auth.user) {
      fetchSkills();
    } else if (!loading) {
      setSkillLoading(false);
    }
  }, [loading, auth.user]);

  const selectedSkillsText = formData.skill_names.length
    ? formData.skill_names.join(", ")
    : formData.skills_summary;

  const profileCompletion = useMemo(() => {
    const fields = [
      formData.first_name,
      formData.last_name,
      formData.email,
      formData.phone,
      formData.department,
      formData.graduation_year,
      formData.cgpa,
      formData.linkedin_url,
      formData.portfolio_url,
      formData.career_objective,
      selectedSkillsText,
      formData.bio,
      removeResume ? "" : auth.user?.resume,
    ];
    const completed = fields.filter((value) => `${value}`.trim()).length;
    return Math.round((completed / fields.length) * 100);
  }, [auth.user?.resume, formData, removeResume, selectedSkillsText]);

  const resumeUrl = useMemo(() => {
    const resumePath = auth.user?.resume;
    if (!resumePath || removeResume) {
      return "";
    }
    if (resumePath.startsWith("http")) {
      return resumePath;
    }
    return new URL(resumePath, BACKEND_ORIGIN).toString();
  }, [auth.user?.resume, removeResume]);

  if (loading) return <PageLoader />;
  if (!auth.user) return <p>No user data</p>;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0] || null;
    setResumeFile(file);
    if (file) {
      setRemoveResume(false);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setRemoveResume(true);
    showToast("Resume will be removed after you save.");
  };

  const toggleSkillSelection = (skillName) => {
    setFormData((prev) => {
      const exists = prev.skill_names.includes(skillName);
      const nextSkillNames = exists
        ? prev.skill_names.filter((item) => item !== skillName)
        : [...prev.skill_names, skillName];

      return {
        ...prev,
        skill_names: nextSkillNames,
        skills_summary: nextSkillNames.join(", "),
      };
    });
  };

  const removeSelectedSkill = (skillName) => {
    setFormData((prev) => {
      const nextSkillNames = prev.skill_names.filter((item) => item !== skillName);
      return {
        ...prev,
        skill_names: nextSkillNames,
        skills_summary: nextSkillNames.join(", "),
      };
    });
    showToast(`Removed "${skillName}" from your skills.`);
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
        const exists = prev.skill_names.some(
          (selectedSkill) =>
            selectedSkill.toLowerCase() === createdSkill.name.toLowerCase()
        );
        if (exists) {
          return prev;
        }

        const nextSkillNames = [...prev.skill_names, createdSkill.name];
        return {
          ...prev,
          skill_names: nextSkillNames,
          skills_summary: nextSkillNames.join(", "),
        };
      });

      showToast(`Skill "${createdSkill.name}" is ready to use.`);
      return true;
    } catch (err) {
      showToast(err.response?.data?.name?.[0] || "Failed to add the skill.", "error");
      return false;
    } finally {
      setAddingSkill(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "registration_no" || key === "skill_names" || key === "skills_summary") {
        return;
      }
      payload.append(key, value ?? "");
    });
    if (formData.skill_names.length > 0) {
      formData.skill_names.forEach((skillName) => {
        payload.append("skill_names", skillName);
      });
    } else {
      payload.append("skill_names", "");
    }
    if (resumeFile) {
      payload.append("resume", resumeFile);
    }
    if (removeResume) {
      payload.append("remove_resume", "true");
    }

    try {
      await api.patch("/students/me/", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await refreshUser(auth.role);
      showToast("Profile updated successfully.");
      setResumeFile(null);
      setRemoveResume(false);
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sp-page">
      <RecruiterToast toast={toast} modalOpen={passwordModalOpen} />
      <StudentNavbar student={auth.user} />

      <div className="sp-container">
        <div className="sp-header">
          <div>
            <p className="sp-eyebrow">Student Profile</p>
            <h1>Profile and Resume Management</h1>
            <p>
              Keep your academic details, contact links, and resume ready before
              you apply.
            </p>
          </div>
          <div className="sp-completion-card">
            <span>Profile Completion</span>
            <strong>{profileCompletion}%</strong>
            <div className="sp-progress">
              <div
                className="sp-progress-fill"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        <div className="sp-grid">
          <form className="sp-card sp-form-card" onSubmit={handleSubmit}>
            <div className="sp-card-header">
              <h2>Edit Details</h2>
              <p>Update the information recruiters see when they review you.</p>
            </div>

            <div className="sp-form-grid">
              <label>
                First Name
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Last Name
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Phone
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                />
              </label>
              <label>
                Registration Number
                <input
                  name="registration_no"
                  value={formData.registration_no}
                  disabled
                />
              </label>
              <label>
                Department
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </label>
              <label>
                Graduation Year
                <input
                  type="number"
                  name="graduation_year"
                  value={formData.graduation_year}
                  onChange={handleChange}
                />
              </label>
              <label>
                CGPA
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                />
              </label>
              <label>
                Active Backlogs
                <input
                  type="number"
                  min="0"
                  name="active_backlogs"
                  value={formData.active_backlogs}
                  onChange={handleChange}
                />
              </label>
              <label>
                LinkedIn URL
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                />
              </label>
              <label>
                Portfolio URL
                <input
                  type="url"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleChange}
                  placeholder="https://your-portfolio.com"
                />
              </label>
            </div>

            <label className="sp-full-width">
              Career Objective
              <textarea
                name="career_objective"
                value={formData.career_objective}
                onChange={handleChange}
                rows="3"
                placeholder="Summarize the role or track you are preparing for."
              />
            </label>

            <div className="sp-full-width">
              <span className="sp-field-title">Skills</span>
              <SkillPicker
                availableSkills={availableSkills}
                selectedSkills={formData.skill_names}
                onToggleSkill={toggleSkillSelection}
                onRemoveSkill={removeSelectedSkill}
                onAddSkill={handleAddSkill}
                loading={skillLoading}
                adding={addingSkill}
                helpText="Search existing skills, select what matches you, or add a new one if it is missing."
                searchPlaceholder="Search or add a skill"
                emptyMessage="No skills available yet. Start by adding your first skill."
              />
            </div>

            <label className="sp-full-width">
              Profile Bio
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Add a short introduction, project strengths, or achievements."
              />
            </label>

            <div className="sp-actions">
              <button type="submit" className="sp-primary-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>

          <div className="sp-side-column">
            <div className="sp-card">
              <div className="sp-card-header">
                <h2>Resume</h2>
                <p>Upload, replace, or remove the resume used for applications.</p>
              </div>

              <div className="sp-resume-box">
                <div>
                  <strong>
                    {resumeFile?.name ||
                      (!removeResume && auth.user.resume_name) ||
                      "No resume uploaded"}
                  </strong>
                  <p>
                    {resumeFile
                      ? "New file selected and ready to upload."
                      : removeResume
                        ? "Resume will be removed after you save."
                        : auth.user.resume
                          ? "Your current resume is available to recruiters."
                          : "Some jobs may require a resume before applying."}
                  </p>
                </div>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                />

                <div className="sp-inline-actions">
                  {resumeUrl && (
                    <a
                      className="sp-secondary-btn"
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Resume
                    </a>
                  )}
                  {(auth.user.resume || resumeFile) && (
                    <button
                      type="button"
                      className="sp-danger-btn"
                      onClick={handleRemoveResume}
                    >
                      Remove Resume
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="sp-card">
              <div className="sp-card-header">
                <h2>Profile Snapshot</h2>
                <p>A quick structured summary of the information on your profile.</p>
              </div>

              <div className="sp-summary-list">
                <div>
                  <span>Name</span>
                  <strong>
                    {formData.first_name} {formData.last_name}
                  </strong>
                </div>
                <div>
                  <span>Registration</span>
                  <strong>{formData.registration_no || "Not available"}</strong>
                </div>
                <div>
                  <span>Academic</span>
                  <strong>
                    {formData.department || "Department pending"} | {formData.cgpa || "CGPA pending"}
                  </strong>
                </div>
                <div>
                  <span>Skills</span>
                  <strong>{selectedSkillsText || "Add your key skills"}</strong>
                </div>
                <div>
                  <span>Resume Status</span>
                  <strong>
                    {resumeFile || (!removeResume && auth.user.resume)
                      ? "Ready to use"
                      : "Missing"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="sp-card">
              <div className="sp-card-header">
                <h2>Account Security</h2>
                <p>Update your password to keep your account protected.</p>
              </div>

              <p className="sp-security-copy">
                You will be asked to enter your current password before saving
                a new one.
              </p>

              <div className="sp-inline-actions">
                <button
                  type="button"
                  className="sp-secondary-btn"
                  onClick={() => setPasswordModalOpen(true)}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StudentFooter />
      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSuccess={(successMessage) => {
          showToast(successMessage);
        }}
      />
    </div>
  );
}

export default StudentProfile;
