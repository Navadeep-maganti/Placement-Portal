import StudentNavbar from "../../components/Navbar/StudentNavbar";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/css/StudentDashboard.css";
function StudentDashboard() {
  const { auth, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!auth.user) return <p>No user data</p>;

  return (
    <div className="student-dashboard">
      <StudentNavbar student={auth.user} />

      <h1>Welcome {auth.user.first_name}</h1>
      <p>Email: {auth.user.email}</p>
      <p>Department: {auth.user.department}</p>
      <p>Graduation Year: {auth.user.graduation_year}</p>
      <p>CGPA: {auth.user.cgpa}</p>
    </div>
  );
}

export default StudentDashboard;
