import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/students/me/")
      .then(res => setStudent(res.data))
      .catch((err) => {
        console.error("ME API ERROR:", err.response?.status, err.response?.data);
      });

  }, [navigate]);

  if (!student) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome {student.first_name}</h1>
      <p>Email: {student.email}</p>
      <p>Department: {student.department}</p>
      <p>Graduation Year: {student.graduation_year}</p>
      <p>CGPA: {student.cgpa}</p>
    </div>
  );
}

export default StudentDashboard;
