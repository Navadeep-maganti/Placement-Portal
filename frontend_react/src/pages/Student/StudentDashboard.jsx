import StudentNavbar from "../../components/Navbar/StudentNavbar";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/css/StudentDashboard.css";
function StudentDashboard() {
  const { auth, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!auth.user) return <p>No user data</p>;

  return (
    <>
      <StudentNavbar student={auth.user} />
      <div className="student-dashboard-body">
        <h2>Welcome, {auth.user.first_name}! &#128075;</h2>
        <div className="current-drive">
          <div className="live-drive"><span>.</span>LIVE DRIVE</div>
          <div className="drive-details">
            <h3>Placement Drive 2025 - 26</h3>
            <p>Unlock your potential with our latest placement drive!</p>
          </div>
        </div>
        <div className="sd-main-div">
          <h3>Placement Overview</h3>
          <div className="overview-div">
            <div className="appliedRoles">
              <h4 className="overview-title">Applied Roles</h4>
              <p className="overview-count">5</p>
            </div>
            <div className="bookmarkedRoles">
              <h4 className="overview-title">Bookmarked Roles</h4>
              <p className="overview-count">3</p>
            </div>
            <div className="shortlisted">
              <h4 className="overview-title">Shortlisted</h4>
              <p className="overview-count">2</p>
              <div className="shortlist-comment">
                <i class="fa-regular fa-calendar"></i>
                <i class="fa-regular fa-clock"></i>
                <span>Interviews scheduled!</span>
              </div>
            </div>
            <div className="offersRecieved">
              <h4 className="overview-title">Offers Received</h4>
              <p className="overview-count">1</p>
              <p className="congratulations"><div className="check-badge">✓</div>Congratulations!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentDashboard;
