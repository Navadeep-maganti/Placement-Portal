import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
/* Public Pages */
import LandingPage from "../pages/Landing/LandingPage";
import Login from "../pages/Login";

/* Student Pages */
import StudentDashboard from "../pages/Student/StudentDashboard";
import MyApplications from "../pages/Student/MyApplications";
import JobsList from "../pages/Student/JobsList";
import JobDetails from "../pages/Student/JobDetails";
import Bookmarks from "../pages/Student/Bookmarks";

/* Admin Pages */
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminApplicants from "../pages/Admin/AdminApplicants";
import AdminJobCreate from "../pages/Admin/AdminJobCreate";
import EditJob from "../pages/Admin/EditJob";

/* Route Protection */
import PrivateRoute from "./PrivateRoute";

export default function AppRouter() {
  const { auth } = useAuth();
  return (
    <Routes>

      {/* ================= PUBLIC ROUTES ================= */}
      if (!auth.access) {
        <Route path="/" element={<LandingPage />} />
      }
      else if (auth.role=="student") {
        <Route path="/" element={<StudentDashboard />} />
      }
      
      <Route path="/login" element={<Login />} />

      {/* ================= STUDENT ROUTES ================= */}
      <Route
        path="/student/dashboard"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/jobs"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <JobsList />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/jobs/:jobId"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <JobDetails />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/applications"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <MyApplications />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/bookmarks"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <Bookmarks />
          </PrivateRoute>
        }
      />

      {/* ================= ADMIN ROUTES ================= */}
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/applicants"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminApplicants />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/jobs/create"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminJobCreate />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/jobs/edit/:jobId"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <EditJob />
          </PrivateRoute>
        }
      />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}
