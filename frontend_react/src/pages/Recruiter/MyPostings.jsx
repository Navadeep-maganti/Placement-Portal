import "../../styles/css/Post.css"
import React from "react";
import CompanyNavbar from "../../components/Navbar/companyNavbar";
import { useAuth } from "../../contexts/AuthContext";

function MyPostings(){
    const { auth, loading } = useAuth();
    return (
        <>
            <CompanyNavbar Company={auth.user} />
            <h1>Post a Job</h1>
        </>
    )
}

export default MyPostings;