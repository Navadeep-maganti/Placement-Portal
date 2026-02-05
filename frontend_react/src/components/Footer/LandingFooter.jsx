import { Link, NavLink } from "react-router-dom";
import "../../styles/css/LandingFooter.css";

function LandingFooter() {
    return (
        <>
            <footer className="landingfooter">
                <div className="footer-content">
                    <div className="left">
                    <h3>Placement Cell</h3>
                    </div>
                    <div className="center">
                        <h3>Quick links</h3>
                    </div>
                    <div className="right" id="contact">
                        <h3>Contact Us</h3>
                        <p><a href="mailto:contact@placementportal.com">contact@placementportal.com</a></p>
                        <p><a href="tel:+1234567890">+1 234 567 890</a></p>
                        <p>123 Placement St, NIT AP</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 NIT AP Placement Portal. All rights reserved.</p>
                </div>
            </footer>
        </>
    );
}

export default LandingFooter;