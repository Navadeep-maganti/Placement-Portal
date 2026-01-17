import React from 'react'
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
      <h2 style={{ textAlign: "center" }}>All Jobs</h2>
    </div>
  )
}

export default JobsList