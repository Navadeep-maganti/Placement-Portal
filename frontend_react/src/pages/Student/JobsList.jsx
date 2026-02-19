import React, { useState } from 'react'
import '../../styles/css/JobsList.css'
import StudentNavbar from '../../components/Navbar/StudentNavbar'
import { useAuth } from '../../contexts/AuthContext'

const JobsList = () => {
  const { auth, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterSalary, setFilterSalary] = useState('all');
  const [viewType, setViewType] = useState('grid');

  const jobs = [
    { id: 1, title: 'Senior Developer', company: 'Google', location: 'Bangalore', salary: '8-10 LPA', type: 'Full-time', skills: 'React, Node.js', applications: 45, deadline: '2025-02-15' },
    { id: 2, title: 'Product Manager', company: 'Microsoft', location: 'Pune', salary: '10-12 LPA', type: 'Full-time', skills: 'Leadership, Analytics', applications: 32, deadline: '2025-02-20' },
    { id: 3, title: 'Data Scientist', company: 'Amazon', location: 'Bangalore', salary: '7-9 LPA', type: 'Full-time', skills: 'Python, ML, SQL', applications: 58, deadline: '2025-02-18' },
    { id: 4, title: 'Frontend Engineer', company: 'Meta', location: 'Delhi', salary: '6-8 LPA', type: 'Full-time', skills: 'React, TypeScript', applications: 67, deadline: '2025-02-22' },
    { id: 5, title: 'DevOps Engineer', company: 'Netflix', location: 'Bangalore', salary: '9-11 LPA', type: 'Full-time', skills: 'Docker, Kubernetes', applications: 28, deadline: '2025-02-16' },
    { id: 6, title: 'Backend Developer', company: 'Uber', location: 'Hyderabad', salary: '7-9 LPA', type: 'Full-time', skills: 'Go, Java, Databases', applications: 41, deadline: '2025-02-25' },
  ];

  if (loading) return <p>Loading...</p>;
  if (!auth.user) return <p>No user data</p>;

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === 'all' || job.location === filterLocation;
    const matchesSalary = filterSalary === 'all' || 
                         (filterSalary === '5-7' && parseInt(job.salary) >= 5 && parseInt(job.salary) <= 7) ||
                         (filterSalary === '7-9' && parseInt(job.salary) >= 7 && parseInt(job.salary) <= 9) ||
                         (filterSalary === '9+' && parseInt(job.salary) >= 9);
    return matchesSearch && matchesLocation && matchesSalary;
  });

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
                <button className="jl-bookmark">BOOKMARK</button>
              </div>
              <p className="jl-company">{job.company}</p>
              <div className="jl-meta">
                <span className="jl-meta-item">{job.location}</span>
                <span className="jl-meta-item">{job.salary}</span>
                <span className="jl-meta-item">{job.type}</span>
              </div>
              <div className="jl-skills">
                {job.skills.split(', ').map((skill, idx) => (
                  <span key={idx} className="jl-skill">{skill}</span>
                ))}
              </div>
              <div className="jl-footer">
                <span className="jl-applicants">{job.applications} applied</span>
                <span className="jl-deadline">{job.deadline}</span>
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