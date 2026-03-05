import React, { useMemo, useState } from 'react'
import '../../styles/css/JobsList.css'
import StudentNavbar from '../../components/Navbar/StudentNavbar'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect } from 'react'
import api from '../../utils/api'
function handleBookmark(jobId) {
  const postBookmark = async () => {
    try {
      await api.post('/bookmarks/', { placement_id: jobId });
      alert('Job bookmarked successfully!');
    } catch (err) {
      alert(
        err.response?.data?.detail || 'Failed to bookmark job'
      );
    }
  }
  postBookmark();
}
const JobsList = () => {
  const { auth, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterSalary, setFilterSalary] = useState('all');
  const [viewType, setViewType] = useState('grid');
  const [pageLoading, setPageLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setError('');
        const response = await api.get('/placements/allplacements/');
        setJobs(response.data || []);
      } catch (err) {
        setError(
          err.response?.data?.detail || 'Failed to fetch jobs'
        );
      }
      finally {
        setPageLoading(false);
      }
    };
    if (!loading && auth.user) {
      fetchJobs();
    }
    else if (!loading) {
      setPageLoading(false);
    }
  }, [loading, auth.user]);

  const normalizedJobs = useMemo(() => {
    return (jobs || []).map((job) => {
      const skills = Array.isArray(job.required_skill_names) ? job.required_skill_names.join(', ') : '';
      return {
        ...job,
        title: job.job_title || '',
        company_display: job.company_name || 'Unknown Company',
        skills_display: skills,
        location_display: job.location || 'N/A',
        salary_display: job.salary || 'N/A',
        type_display: job.type || 'Full-time',
        applications_display: job.no_of_applicants ?? 0,
        deadline_display: job.application_deadline || 'N/A',
      };
    });
  }, [jobs]);

  const filteredJobs = normalizedJobs.filter(job => {
    const title = (job.title || '').toLowerCase();
    const company = (job.company_display || '').toLowerCase();
    const skills = (job.skills_display || '').toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase()) ||
      company.includes(searchTerm.toLowerCase()) ||
      skills.includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === 'all' || job.location_display === filterLocation;
    const matchesSalary = filterSalary === 'all' ||
      (filterSalary === '5-7' && parseInt(job.salary_display, 10) >= 5 && parseInt(job.salary_display, 10) <= 7) ||
      (filterSalary === '7-9' && parseInt(job.salary_display, 10) >= 7 && parseInt(job.salary_display, 10) <= 9) ||
      (filterSalary === '9+' && parseInt(job.salary_display, 10) >= 9);
    return matchesSearch && matchesLocation && matchesSalary;
  });

  if (loading) return <p>Loading...</p>;
  if (!auth.user) return <p>No user data</p>;

  return (
    <div className="jl-page">
      <StudentNavbar student={auth.user} />

      <div className="jl-container">
        <div className="jl-header">
          <h1>Explore Opportunities</h1>
          <p>Discover amazing job openings and apply now</p>
        </div>

        <div className="jl-filters">
          <div className="jl-search">
            <input
              type="text"
              placeholder="Search by job title, company, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="jl-filter-row">
            <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="jl-select">
              <option value="all">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Pune">Pune</option>
              <option value="Delhi">Delhi</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>

            <select value={filterSalary} onChange={(e) => setFilterSalary(e.target.value)} className="jl-select">
              <option value="all">All Salaries</option>
              <option value="5-7">5-7 LPA</option>
              <option value="7-9">7-9 LPA</option>
              <option value="9+">9+ LPA</option>
            </select>

            <div className="jl-view-toggle">
              <button className={`jl-toggle-btn ${viewType === 'grid' ? 'active' : ''}`} onClick={() => setViewType('grid')}>Grid</button>
              <button className={`jl-toggle-btn ${viewType === 'list' ? 'active' : ''}`} onClick={() => setViewType('list')}>List</button>
            </div>
          </div>
        </div>

        <div className="jl-results">
          <p>Showing <strong>{filteredJobs.length}</strong> opportunities</p>
        </div>

        <div className={`jl-cards ${viewType === 'grid' ? 'jl-grid' : 'jl-list'}`}>
          {filteredJobs.map((job) => (
            <div key={job.id} className="jl-card">
              <div className="jl-card-header">
                <h3>{job.title}</h3>
                <button className="jl-bookmark" onClick={() => handleBookmark(job.id)}>
                  BOOKMARK
                </button>
              </div>
              <p className="jl-company">{job.company_display}</p>
              <div className="jl-meta">
                <span className="jl-meta-item">{job.location_display}</span>
                <span className="jl-meta-item">{job.salary_display}</span>
                <span className="jl-meta-item">{job.type_display}</span>
              </div>
              <div className="jl-skills">
                {(job.skills_display ? job.skills_display.split(', ') : ['No skills specified']).map((skill, idx) => (
                  <span key={idx} className="jl-skill">{skill}</span>
                ))}
              </div>
              <div className="jl-footer">
                <span className="jl-applicants">{job.applications_display} applied</span>
                <span className="jl-deadline">{job.deadline_display}</span>
              </div>
              <button className="jl-apply">Apply Now</button>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="jl-empty">
            <p>No jobs found matching your criteria</p>
            <p>Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobsList
