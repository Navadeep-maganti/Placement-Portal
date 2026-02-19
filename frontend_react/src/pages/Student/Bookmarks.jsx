import React, { useState } from 'react'
import StudentNavbar from '../../components/Navbar/StudentNavbar'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/css/Bookmarks.css'

const Bookmarks = () => {
  const { auth, loading } = useAuth();
  const [bookmarks, setBookmarks] = useState([
    {
      id: 1,
      jobTitle: 'Senior Developer',
      company: 'Google',
      location: 'Bangalore',
      salary: '8-10 LPA',
      type: 'Full-time',
      skills: ['React', 'Node.js', 'Python'],
      savedDate: '2025-01-18',
      deadline: '2025-02-15',
      applications: 45
    },
    {
      id: 2,
      jobTitle: 'Product Manager',
      company: 'Microsoft',
      location: 'Pune',
      salary: '10-12 LPA',
      type: 'Full-time',
      skills: ['Leadership', 'Analytics', 'Strategy'],
      savedDate: '2025-01-16',
      deadline: '2025-02-20',
      applications: 32
    },
    {
      id: 3,
      jobTitle: 'Data Scientist',
      company: 'Amazon',
      location: 'Bangalore',
      salary: '7-9 LPA',
      type: 'Full-time',
      skills: ['Python', 'ML', 'SQL'],
      savedDate: '2025-01-15',
      deadline: '2025-02-18',
      applications: 58
    },
  ]);

  const [viewType, setViewType] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');

  if (loading) return <p>Loading...</p>;
  if (!auth.user) return <p>No user data</p>;

  const handleRemoveBookmark = (id) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.savedDate) - new Date(a.savedDate);
    if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
    return 0;
  });

  return (
    <div className="bm-bookmarks-page">
      <StudentNavbar student={auth.user} />

      <div className="bm-bookmarks-container">
        <div className="bm-bookmarks-header">
          <h1>Saved Jobs</h1>
          <p>Jobs you have bookmarked for later review</p>
        </div>

        <div className="bm-bookmarks-controls">
          <div className="bm-controls-left">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bm-sort-select">
              <option value="recent">Recently Saved</option>
              <option value="deadline">Deadline Approaching</option>
            </select>
          </div>
          <div className="bm-controls-right">
            <div className="bm-view-toggle">
              <button className={`bm-toggle-btn ${viewType === 'grid' ? 'bm-active' : ''}`} onClick={() => setViewType('grid')}>Grid</button>
              <button className={`bm-toggle-btn ${viewType === 'list' ? 'bm-active' : ''}`} onClick={() => setViewType('list')}>List</button>
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
                    onClick={() => handleRemoveBookmark(bookmark.id)}
                    title="Remove bookmark"
                  >
                    X
                  </button>
                </div>

                <p className="bm-company-name">{bookmark.company}</p>

                <div className="bm-bookmark-meta">
                  <span>{bookmark.location}</span>
                  <span>{bookmark.salary}</span>
                  <span>{bookmark.type}</span>
                </div>

                <div className="bm-bookmark-skills">
                  {bookmark.skills.map((skill, idx) => (
                    <span key={idx} className="bm-skill-tag">{skill}</span>
                  ))}
                </div>

                <div className="bm-bookmark-footer">
                  <span className="bm-saved-date">Saved: {new Date(bookmark.savedDate).toLocaleDateString()}</span>
                  <span className="bm-deadline">Deadline: {bookmark.deadline}</span>
                </div>

                <div className="bm-bookmark-actions">
                  <button className="bm-view-job-btn">View Job</button>
                  <button className="bm-apply-btn">Apply Now</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bm-no-bookmarks">
            <div className="bm-empty-state">
              <p className="bm-empty-icon">FILE</p>
              <p className="bm-empty-title">No Bookmarks Yet</p>
              <p className="bm-empty-message">Start bookmarking jobs to save them for later!</p>
              <button className="bm-explore-btn">Explore Jobs</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Bookmarks;