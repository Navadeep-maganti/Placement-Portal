import React from 'react'
import '../../styles/css/JobsList.css'
import StudentNavbar from '../../components/Navbar/StudentNavbar'
import { useAuth } from '../../contexts/AuthContext'
const JobsList = () => {
  const { auth, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!auth.user) return <p>No user data</p>;
  const student = auth.user;
  return (
    <div>
      <StudentNavbar student={student} />
      <h2 className="jobs-list-title">All Jobs</h2>
    </div>
  )
}

export default JobsList