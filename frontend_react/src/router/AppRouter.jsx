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
import StudentProfile from "../pages/Student/StudentProfile";
import Mentors from "../pages/Student/Mentors";
import Workshops from "../pages/Student/Workshops";
import Hackathons from "../pages/Student/Hackathons";

/* Company Pages */
import CompanyDashboard from "../pages/Recruiter/RecruiterDashboard";
import MyPostings from "../pages/Recruiter/RecruiterPostingsPage";
import Manage from "../pages/Recruiter/ManageApplications";
import ViewApplicants from "../pages/Recruiter/RecruiterApplicantsPage";
import CompanyProfile from "../pages/Recruiter/CompanyProfile";

/* Admin Pages */
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminApplicants from "../pages/Admin/AdminApplicants";
import AdminJobCreate from "../pages/Admin/AdminJobCreate";
import EditJob from "../pages/Admin/EditJob";

/* Route Protection */
import PrivateRoute from "./PrivateRoute";
import PageLoader from "../components/Common/PageLoader";

function HomeRedirect() {
  const { auth, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (auth.access) {
    if (auth.role === "student") {
      return <Navigate to="/student/dashboard" />;
    }
    else if (auth.role === "company") {
      return <Navigate to="/company/dashboard" />;
    }
    else if (auth.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    }
  }
  return <LandingPage />;
}

export default function AppRouter() {
  return (
    <Routes>

      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/" element={<HomeRedirect />} />
      
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

      <Route
        path="/student/profile"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentProfile />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/mentors"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <Mentors />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/workshops"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <Workshops />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/hackathons"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <Hackathons />
          </PrivateRoute>
        }
      />

      {/* Company routes */}
      <Route
        path="/company/dashboard"
        element={
          <PrivateRoute allowedRoles={["company"]}>
            <CompanyDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/company/profile"
        element={
          <PrivateRoute allowedRoles={["company"]}>
            <CompanyProfile />
          </PrivateRoute>
        }
      />

      <Route
        path="/Company/profile"
        element={<Navigate to="/company/profile" replace />}
      />

      <Route
        path="/Recruiter/MyPostings"
        element={
          <PrivateRoute allowedRoles={["company"]}>
            <MyPostings />
          </PrivateRoute>
        }
      />

      <Route
        path="/Recruiter/Manage"
        element={
          <PrivateRoute allowedRoles={["company"]}>
            <Manage />
          </PrivateRoute>
        }
      />

      <Route
        path="/Recruiter/ViewApplicants"
        element={
          <PrivateRoute allowedRoles={["company"]}>
            <ViewApplicants />
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
