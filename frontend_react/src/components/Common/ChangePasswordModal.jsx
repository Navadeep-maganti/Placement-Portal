import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import "../../styles/css/StudentModal.css";

const emptyForm = {
  current_password: "",
  new_password: "",
  confirm_new_password: "",
};

const normalizeMessages = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return [value].filter(Boolean);
};

function ChangePasswordModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData(emptyForm);
      setFieldErrors({});
      setFormError("");
      setSubmitting(false);
    }
  }, [open]);

  const confirmPasswordError = useMemo(() => {
    if (!formData.confirm_new_password) {
      return "";
    }

    return formData.new_password === formData.confirm_new_password
      ? ""
      : "New password confirmation does not match.";
  }, [formData.confirm_new_password, formData.new_password]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [name]: [],
    }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (confirmPasswordError) {
      setFieldErrors((prev) => ({
        ...prev,
        confirm_new_password: [confirmPasswordError],
      }));
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});
      setFormError("");
      const response = await api.post("/auth/change-password/", formData);
      onSuccess?.(response.data?.detail || "Password updated successfully.");
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const nextErrors = {};

        Object.entries(data).forEach(([key, value]) => {
          if (key === "detail" || key === "non_field_errors") {
            return;
          }
          nextErrors[key] = normalizeMessages(value);
        });

        setFieldErrors(nextErrors);
        setFormError(
          normalizeMessages(data.detail)[0] ||
            normalizeMessages(data.non_field_errors)[0] ||
            ""
        );
      } else {
        setFormError("Unable to update your password right now. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sm-overlay" role="dialog" aria-modal="true" aria-labelledby="change-password-title">
      <div className="sm-panel sm-panel-compact">
        <div className="sm-header">
          <div>
            <p className="sm-eyebrow">Account Security</p>
            <h2 id="change-password-title">Change Password</h2>
            <p>
              Confirm your current password, then set a new password for your
              account.
            </p>
          </div>
          <button className="sm-close" onClick={onClose} type="button">
            Close
          </button>
        </div>

        {formError && <p className="sm-message sm-error">{formError}</p>}

        <form className="sm-form" onSubmit={handleSubmit}>
          <div className="sm-stack">
            <label className="sm-field">
              <span>Current Password</span>
              <input
                type="password"
                name="current_password"
                autoComplete="current-password"
                value={formData.current_password}
                onChange={handleChange}
                required
              />
              {fieldErrors.current_password?.map((message) => (
                <span key={message} className="sm-field-error">
                  {message}
                </span>
              ))}
            </label>

            <label className="sm-field">
              <span>New Password</span>
              <input
                type="password"
                name="new_password"
                autoComplete="new-password"
                value={formData.new_password}
                onChange={handleChange}
                required
              />
              {fieldErrors.new_password?.map((message) => (
                <span key={message} className="sm-field-error">
                  {message}
                </span>
              ))}
            </label>

            <label className="sm-field">
              <span>Confirm New Password</span>
              <input
                type="password"
                name="confirm_new_password"
                autoComplete="new-password"
                value={formData.confirm_new_password}
                onChange={handleChange}
                required
              />
              {(fieldErrors.confirm_new_password || []).map((message) => (
                <span key={message} className="sm-field-error">
                  {message}
                </span>
              ))}
            </label>
          </div>

          <p className="sm-note">
            Use a strong password with at least 8 characters and avoid reusing
            your current one.
          </p>

          <div className="sm-actions sm-actions-end">
            <button type="button" className="sm-secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sm-primary-btn" disabled={submitting}>
              {submitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
