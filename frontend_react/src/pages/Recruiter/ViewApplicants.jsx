import React from "react";
import "../../styles/css/Applications.css";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import { useAuth } from "../../contexts/AuthContext";

function ViewApplicants(){
    const { auth, loading } = useAuth();
    return(
        <>
            <CompanyNavbar Company={auth.user} />
            <h1>Company Applications</h1>
        </>
    )
}

export default ViewApplicants;