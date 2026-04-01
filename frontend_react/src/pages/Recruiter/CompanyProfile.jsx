import React, { useEffect, useState } from "react";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import PageLoader from "../../components/Common/PageLoader";
import RecruiterToast from "../../components/Recruiter/RecruiterToast";
import { useAuth } from "../../contexts/AuthContext";
import useRecruiterToast from "../../hooks/useRecruiterToast";
import api from "../../utils/api";
import "../../styles/css/CompanyProfile.css";

const emptyProfile = {
  first_name: "",
  last_name: "",
  company_name: "",
  location: "",
  industry: "",
  website: "",
  description: "",
};

function CompanyProfile() {
  const { auth, loading, refreshUser } = useAuth();
  const [formData, setFormData] = useState(emptyProfile);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const { toast, showToast } = useRecruiterToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError("");
        const response = await api.get("/companies/me/");
        setFormData({ ...emptyProfile, ...response.data });
      } catch (err) {
        const message =
          err.response?.data?.detail || "Failed to load recruiter profile.";
        setError(message);
        showToast(message, "error");
      } finally {
        setPageLoading(false);
      }
    };

    if (!loading && auth.user) {
      fetchProfile();
    } else if (!loading) {
      setPageLoading(false);
    }
  }, [loading, auth.user, showToast]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setFeedback("");
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        company_name: formData.company_name,
        location: formData.location,
        industry: formData.industry,
        website: formData.website,
        description: formData.description,
      };
      const response = await api.patch("/companies/me/", payload);
      setFormData({ ...emptyProfile, ...response.data });
      await refreshUser("company");
      setFeedback("Recruiter profile updated successfully.");
      showToast("Recruiter profile updated successfully.");
    } catch (err) {
      const message =
        err.response?.data?.detail || "Failed to update recruiter profile.";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || pageLoading) return <PageLoader />;
  if (!auth.user) return <p>User information is unavailable.</p>;

  return (
    <>
      <RecruiterToast toast={toast} />
      <CompanyNavbar Company={auth.user} />
      <div className="cp-page">
        <main className="cp-container">
          <section className="cp-hero">
            <div>
              <h1>Recruiter Profile</h1>
              <p>Maintain accurate company information so candidates can view a credible and complete employer profile.</p>
              {error && <p className="cp-inline-message cp-error">{error}</p>}
              {feedback && <p className="cp-inline-message cp-success">{feedback}</p>}
            </div>
            <div className="cp-status-badge">
              {formData.is_approved ? "Approved Company" : "Approval Pending"}
            </div>
          </section>

          <form className="cp-card" onSubmit={handleSubmit}>
            <div className="cp-grid">
              <div>
                <label htmlFor="first_name">Recruiter First Name</label>
                <input id="first_name" name="first_name" value={formData.first_name || ""} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="last_name">Recruiter Last Name</label>
                <input id="last_name" name="last_name" value={formData.last_name || ""} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="company_name">Company Name</label>
                <input id="company_name" name="company_name" value={formData.company_name || ""} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" value={formData.email || ""} readOnly />
              </div>
              <div>
                <label htmlFor="location">Location</label>
                <input id="location" name="location" value={formData.location || ""} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="industry">Industry</label>
                <input id="industry" name="industry" value={formData.industry || ""} onChange={handleChange} />
              </div>
            </div>

            <div className="cp-field">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" value={formData.website || ""} onChange={handleChange} />
            </div>

            <div className="cp-field">
              <label htmlFor="description">Company Description</label>
              <textarea
                id="description"
                name="description"
                rows="6"
                value={formData.description || ""}
                onChange={handleChange}
              />
            </div>

            <div className="cp-actions">
              <button className="cp-primary-btn" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}

export default CompanyProfile;
