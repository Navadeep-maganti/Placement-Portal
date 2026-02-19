import React from "react";
import "../../styles/css/CompanyDashboard.css";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import { useAuth } from "../../contexts/AuthContext";

function companyDashboard() {
  const { auth, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!auth.user) return <p>No user data</p>;
    return (
        <>
            <CompanyNavbar Company={auth.user} />
        </>
    );
}
    export default companyDashboard;