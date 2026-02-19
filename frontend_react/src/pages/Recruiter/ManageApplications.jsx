import React from "react";
import "../../styles/css/Manage.css";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import { useAuth } from "../../contexts/AuthContext";

function Manage(){
    const { auth, loading } = useAuth();
    return(
        <>
            <CompanyNavbar Company={auth.user} />
            <h1>Manage Company</h1>
        </>
    )
}

export default Manage;