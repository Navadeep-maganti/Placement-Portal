import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StudentNavbar from '../../components/Navbar/StudentNavbar'
import ApplicationReviewModal from '../../components/Student/ApplicationReviewModal'
import PageLoader from '../../components/Common/PageLoader'
import RecruiterToast from '../../components/Recruiter/RecruiterToast'
import { useAuth } from '../../contexts/AuthContext'
import useRecruiterToast from '../../hooks/useRecruiterToast'
import api from '../../utils/api'
import '../../styles/css/Bookmarks.css'
import StudentFooter from '../../components/Footer/StudentFooter'
import { formatStatusLabel } from '../../utils/studentApplication'

const formatDate = (value, fallback = 'N/A') => {
  if (!value) {
    return fallback;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return fallback;
  }

  return parsedDate.toLocaleDateString();
};

const Bookmarks = () => {
  const navigate = useNavigate();
  const { auth, loading } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [viewType, setViewType] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [applying, setApplying] = useState(false);
  const { toast, showToast } = useRecruiterToast();

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        setError('');
        const response = await api.get('/bookmarks/');
        setBookmarks(response.data || []);
      } catch (err) {
        const message =
          err.response?.data?.detail ||
          err.response?.data?.error ||
          'Failed to load bookmarks';
        setError(message);
        showToast(message, 'error');
      } finally {
        setPageLoading(false);
      }
    };

    if (!loading && auth.user) {
      loadBookmarks();
    } else if (!loading) {
      setPageLoading(false);
    }
  }, [loading, auth.user]);

  if (loading || pageLoading) return <PageLoader />;
  if (!auth.user) return <p>No user data</p>;

  const handleRemoveBookmark = async (bookmark) => {
    try {
      setError('');
      await api.delete(`/bookmarks/${bookmark.placement}/`);
      setBookmarks((prev) => prev.filter((item) => item.id !== bookmark.id));
      if (selectedBookmark?.id === bookmark.id) {
        setSelectedBookmark(null);
      }
      showToast('Bookmark removed.');
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to remove bookmark';
      setError(message);
      showToast(message, 'error');
    }
  };

  const handleViewJob = (bookmark) => {
    navigate(`/student/jobs/${bookmark.placement}`);
  };

  const handleApplyNow = async (applicationProfile) => {
    if (!selectedBookmark) {
      return;
    }

    try {
      setError('');
      setApplying(true);
      const response = await api.post('/applications/apply/', {
        placement_id: selectedBookmark.placement,
        application_profile: applicationProfile,
      });
      const application = response.data?.application || response.data;
      setBookmarks((prev) =>
        prev.map((item) =>
          item.id === selectedBookmark.id
            ? {
                ...item,
                has_applied: true,
                application_status:
                  application?.status || item.application_status || 'applied',
              }
            : item
        )
      );
      showToast(response.data?.message || 'Application submitted successfully.');
      setSelectedBookmark(null);
    } catch (err) {
      const issues = err.response?.data?.eligibility_issues;
      const message =
        Array.isArray(issues) && issues.length
          ? issues.join(' ')
          : err.response?.data?.detail ||
            err.response?.data?.error ||
            'Failed to apply';
      setError(message);
      showToast(message, 'error');
    } finally {
      setApplying(false);
    }
  };

  const normalizedBookmarks = bookmarks.map((bookmark) => ({
    ...bookmark,
    jobTitle: bookmark.job_title,
    company: bookmark.company_name || 'Unknown Company',
    location: bookmark.location || 'N/A',
    salaryDisplay:
      bookmark.salary_lpa || (bookmark.salary ? `${bookmark.salary} LPA` : 'N/A'),
    skills: Array.isArray(bookmark.required_skill_names)
      ? bookmark.required_skill_names
      : [],
    savedDate: bookmark.created_at,
    savedDateDisplay: formatDate(bookmark.created_at),
    deadline: bookmark.application_deadline || '',
    deadlineDisplay: formatDate(bookmark.application_deadline),
    hasApplied: bookmark.has_applied,
    applicationStatus: bookmark.application_status,
    isEligible: bookmark.is_eligible !== false,
    eligibilityIssues: Array.isArray(bookmark.eligibility_issues)
      ? bookmark.eligibility_issues
      : [],
    resumeRequired: Boolean(bookmark.resume_required),
  }));

  const sortedBookmarks = [...normalizedBookmarks].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.savedDate) - new Date(a.savedDate);
    }

    if (sortBy === 'deadline') {
      const deadlineA = a.deadline
        ? new Date(a.deadline).getTime()
        : Number.POSITIVE_INFINITY;
      const deadlineB = b.deadline
        ? new Date(b.deadline).getTime()
        : Number.POSITIVE_INFINITY;
      return deadlineA - deadlineB;
    }

    return 0;
  });

  return (
    <div className="bm-bookmarks-page">
      <RecruiterToast toast={toast} modalOpen={Boolean(selectedBookmark)} />
      <StudentNavbar student={auth.user} />

      <div className="bm-bookmarks-container">
        <div className="bm-bookmarks-header">
          <h1>Saved Jobs</h1>
          <p>Jobs you have bookmarked for later review</p>
          <p className="bm-bookmark-count">
            {sortedBookmarks.length} saved {sortedBookmarks.length === 1 ? 'role' : 'roles'}
          </p>
        </div>

        <div className="bm-bookmarks-controls">
          <div className="bm-controls-left">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bm-sort-select"
            >
              <option value="recent">Recently Saved</option>
              <option value="deadline">Deadline Approaching</option>
            </select>
          </div>
          <div className="bm-controls-right">
            <div className="bm-view-toggle">
              <button
                className={`bm-toggle-btn ${viewType === 'grid' ? 'bm-active' : ''}`}
                onClick={() => setViewType('grid')}
              >
                Grid
              </button>
              <button
                className={`bm-toggle-btn ${viewType === 'list' ? 'bm-active' : ''}`}
                onClick={() => setViewType('list')}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {sortedBookmarks.length > 0 ? (
          <div className={`bm-bookmarks-${viewType}`}>
            {sortedBookmarks.map((bookmark) => (
              <div key={bookmark.id} className="bm-bookmark-card">
                <div className="bm-bookmark-header">
                  <h3>{bookmark.jobTitle}</h3>
                  <button
                    className="bm-remove-bookmark-btn"
                    onClick={() => handleRemoveBookmark(bookmark)}
                    title="Remove bookmark"
                    aria-label={`Remove ${bookmark.jobTitle} from bookmarks`}
                  >
                    Remove
                  </button>
                </div>

                <p className="bm-company-name">{bookmark.company}</p>

                <div className="bm-bookmark-meta">
                  <span>{bookmark.location}</span>
                  <span>{bookmark.salaryDisplay}</span>
                  <span>{bookmark.resumeRequired ? 'Resume Required' : 'Resume Optional'}</span>
                </div>

                <div className="bm-bookmark-status-row">
                  <span
                    className={`bm-status-badge ${
                      bookmark.hasApplied
                        ? 'applied'
                        : bookmark.isEligible
                          ? 'eligible'
                          : 'blocked'
                    }`}
                  >
                    {bookmark.hasApplied
                      ? formatStatusLabel(bookmark.applicationStatus)
                      : bookmark.isEligible
                        ? 'Eligible'
                        : 'Not Eligible'}
                  </span>
                  {!bookmark.isEligible && bookmark.eligibilityIssues.length > 0 && (
                    <span className="bm-eligibility-note">{bookmark.eligibilityIssues[0]}</span>
                  )}
                </div>

                <div className="bm-bookmark-skills">
                  {(bookmark.skills.length ? bookmark.skills : ['No skills specified']).map((skill, idx) => (
                    <span key={idx} className="bm-skill-tag">{skill}</span>
                  ))}
                </div>

                <div className="bm-bookmark-footer">
                  <span className="bm-saved-date">Saved: {bookmark.savedDateDisplay}</span>
                  <span className="bm-deadline">Deadline: {bookmark.deadlineDisplay}</span>
                </div>

                {!auth.user.resume && bookmark.resumeRequired && (
                  <p className="bm-inline-note">
                    This role needs a resume. Update it from{' '}
                    <Link to="/student/profile">your profile</Link>.
                  </p>
                )}

                <div className="bm-bookmark-actions">
                  <button className="bm-view-job-btn" onClick={() => handleViewJob(bookmark)}>
                    View Job
                  </button>
                  <button
                    className="bm-apply-btn"
                    onClick={() => setSelectedBookmark(bookmark)}
                    disabled={bookmark.hasApplied || !bookmark.isEligible}
                  >
                    {bookmark.hasApplied
                      ? formatStatusLabel(bookmark.applicationStatus)
                      : bookmark.isEligible
                        ? 'Apply Now'
                        : 'Not Eligible'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bm-no-bookmarks">
            <div className="bm-empty-state">
              <p className="bm-empty-icon">SAVE</p>
              <p className="bm-empty-title">No Bookmarks Yet</p>
              <p className="bm-empty-message">Start bookmarking jobs to save them for later!</p>
              <Link className="bm-explore-btn" to="/student/jobs">
                Explore Jobs
              </Link>
            </div>
          </div>
        )}
      </div>
      <ApplicationReviewModal
        open={Boolean(selectedBookmark)}
        student={auth.user}
        job={
          selectedBookmark
            ? {
                id: selectedBookmark.placement,
                job_title: selectedBookmark.jobTitle,
                company_name: selectedBookmark.company,
                salary_lpa: selectedBookmark.salaryDisplay,
                application_deadline: selectedBookmark.deadline,
              }
            : null
        }
        submitting={applying}
        error={error}
        onClose={() => {
          setSelectedBookmark(null)
          setError('')
        }}
        onSubmit={handleApplyNow}
      />
      <StudentFooter />
    </div>
  )
}

export default Bookmarks;
