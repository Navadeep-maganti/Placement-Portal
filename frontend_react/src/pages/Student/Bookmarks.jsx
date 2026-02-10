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
    <div className="bookmarks-page">
      <StudentNavbar student={auth.user} />

      <div className="bookmarks-container">
        <div className="bookmarks-header">
          <h1>Saved Jobs</h1>
          <p>Jobs you have bookmarked for later review</p>
        </div>

        <div className="bookmarks-controls">
          <div className="controls-left">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="recent">Recently Saved</option>
              <option value="deadline">Deadline Approaching</option>
            </select>
          </div>
          <div className="controls-right">
            <div className="view-toggle">
              <button className={`toggle-btn ${viewType === 'grid' ? 'active' : ''}`} onClick={() => setViewType('grid')}>Grid</button>
              <button className={`toggle-btn ${viewType === 'list' ? 'active' : ''}`} onClick={() => setViewType('list')}>List</button>
            </div>
          </div>
        </div>

        {sortedBookmarks.length > 0 ? (
          <div className={`bookmarks-${viewType}`}>
            {sortedBookmarks.map((bookmark) => (
              <div key={bookmark.id} className="bookmark-card">
                <div className="bookmark-header">
                  <h3>{bookmark.jobTitle}</h3>
                  <button 
                    className="remove-bookmark-btn"
                    onClick={() => handleRemoveBookmark(bookmark.id)}
                    title="Remove bookmark"
                  >
                    X
                  </button>
                </div>

                <p className="company-name">{bookmark.company}</p>

                <div className="bookmark-meta">
                  <span>{bookmark.location}</span>
                  <span>{bookmark.salary}</span>
                  <span>{bookmark.type}</span>
                </div>

                <div className="bookmark-skills">
                  {bookmark.skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>

                <div className="bookmark-footer">
                  <span className="saved-date">Saved: {new Date(bookmark.savedDate).toLocaleDateString()}</span>
                  <span className="deadline">Deadline: {bookmark.deadline}</span>
                </div>

                <div className="bookmark-actions">
                  <button className="view-job-btn">View Job</button>
                  <button className="apply-btn">Apply Now</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-bookmarks">
            <div className="empty-state">
              <p className="empty-icon">FILE</p>
              <p className="empty-title">No Bookmarks Yet</p>
              <p className="empty-message">Start bookmarking jobs to save them for later!</p>
              <button className="explore-btn">Explore Jobs</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Bookmarks;