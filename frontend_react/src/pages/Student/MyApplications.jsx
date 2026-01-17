import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import StudentNavbar from '../../components/Navbar/StudentNavbar';
const MyApplications = () => {
  const { auth, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!auth.user) return <p>No user data</p>;
  const student = auth.user;
  return (

    <div>
      <StudentNavbar student={student} /> 
      <h2 style={{ textAlign: "center" }}>My Applications</h2>
    </div>
  )
}

export default MyApplications