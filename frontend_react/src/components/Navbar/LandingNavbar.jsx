import { Link, NavLink } from "react-router-dom";
import "../../styles/css/LandingNavbar.css";

function LandingNavbar() {
    return (
        <nav className="Landing-navbar">
            {/* LEFT */}
            <div className="left-nav nav-surface">
                <Link to="/" className="nav-title">
                    Placement Portal
                    <br />
                    <span className="nav-subtitle">NIT AP</span>
                </Link>
            </div>

            {/* CENTER */}
            <div className="center-nav nav-surface">
                {/* ------------------About US------------------ */}
                <Link
                    to="/landingPage#PlacementStats"
                    className="landing-link"
                    onClick={(e) => {
                        e.preventDefault();
                        document
                            .getElementById("PlacementStats")
                            .scrollIntoView({ behavior: "smooth" });
                    }}
                >
                    About Us
                </Link>
                {/* ------------------Recruting Process------------------ */}
                <Link
                    to="/landingPage#recruitment"
                    className="landing-link"
                    onClick={(e) => {
                        e.preventDefault();
                        document
                            .getElementById("recruitment")
                            .scrollIntoView({ behavior: "smooth" });
                    }}
                >
                    Recruting Process
                </Link>
                {/* ------------------Contact Us------------------ */}
                <a
                    href="#contact"
                    className="landing-link"
                    onClick={(e) => {
                        e.preventDefault();
                        document
                            .getElementById("contact")
                            .scrollIntoView({ behavior: "smooth" });
                    }}
                >
                    Contact Us
                </a>
            </div>

            {/* RIGHT */}
            <div className="right-nav nav-surface">
                <Link to="/login" className="landing-loginBtn">Login</Link>

            </div>
        </nav>
    );
}

export default LandingNavbar;
