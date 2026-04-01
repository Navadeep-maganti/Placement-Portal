import { Link, NavLink } from "react-router-dom";
import StudentNavbar from "../Navbar/StudentNavbar";
import StudentFooter from "../Footer/StudentFooter";
import PageLoader from "../Common/PageLoader";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/css/StudentResources.css";

const resourceLinks = [
  { to: "/student/mentors", label: "Mentors" },
  { to: "/student/workshops", label: "Workshops" },
  { to: "/student/hackathons", label: "Hackathons" },
];

function ResourceAction({ action }) {
  const className = `sr-btn ${action.variant || "primary"}`;

  if (action.to) {
    return (
      <Link to={action.to} className={className}>
        {action.label}
      </Link>
    );
  }

  return (
    <a href={action.href} className={className}>
      {action.label}
    </a>
  );
}

function StudentResourcePage({ page }) {
  const { auth, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!auth.user) return <p>No user data</p>;

  return (
    <div className="sr-page">
      <StudentNavbar student={auth.user} />

      <div className="sr-container">
        <section className={`sr-hero ${page.heroClassName}`}>
          <div className="sr-hero-copy">
            <span className="sr-badge">{page.hero.eyebrow}</span>
            <h1>{page.hero.title}</h1>
            <p>{page.hero.description}</p>

            <div className="sr-actions">
              {page.hero.actions.map((action) => (
                <ResourceAction key={action.label} action={action} />
              ))}
            </div>
          </div>

          <div className="sr-highlight">
            <span className="sr-highlight-label">{page.spotlight.label}</span>
            <h2>{page.spotlight.title}</h2>
            <p>{page.spotlight.description}</p>
            <div className="sr-pill-row">
              {page.spotlight.pills.map((pill) => (
                <span key={pill} className="sr-pill">
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="sr-switcher">
          <div>
            <h3>Student resources</h3>
            <p>Simple static pages for now, ready to swap to API data later.</p>
          </div>

          <div className="sr-switch-links">
            {resourceLinks.map((resourceLink) => (
              <NavLink
                key={resourceLink.to}
                to={resourceLink.to}
                className={({ isActive }) =>
                  isActive ? "sr-switch-link active" : "sr-switch-link"
                }
              >
                {resourceLink.label}
              </NavLink>
            ))}
          </div>
        </section>

        <section className="sr-stats">
          {page.stats.map((stat) => (
            <div key={stat.label} className="sr-stat-card">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="sr-section" id="featured">
          <div className="sr-section-head">
            <div>
              <h3>{page.featured.title}</h3>
              <p>{page.featured.subtitle}</p>
            </div>
          </div>

          <div className="sr-card-grid">
            {page.featured.items.map((item) => (
              <article key={item.title} className="sr-card">
                <span className="sr-card-eyebrow">{item.eyebrow}</span>
                <h4>{item.title}</h4>
                <div className="sr-card-meta">{item.meta}</div>
                <p>{item.description}</p>
                <div className="sr-chip-row">
                  {item.tags.map((tag) => (
                    <span key={tag} className="sr-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="sr-section">
          <div className="sr-section-head">
            <div>
              <h3>{page.timeline.title}</h3>
              <p>{page.timeline.subtitle}</p>
            </div>
          </div>

          <div className="sr-list">
            {page.timeline.items.map((item) => (
              <article key={item.title} className="sr-list-item">
                <span className="sr-list-badge">{item.badge}</span>
                <div className="sr-list-copy">
                  <h4>{item.title}</h4>
                  <div className="sr-card-meta">{item.meta}</div>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="sr-section sr-tips">
          <div className="sr-section-head">
            <div>
              <h3>{page.tips.title}</h3>
              <p>These are also static helper notes for now.</p>
            </div>
          </div>

          <div className="sr-tip-grid">
            {page.tips.items.map((tip, index) => (
              <div key={tip} className="sr-tip-card">
                <span>{`0${index + 1}`}</span>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </section>

        <StudentFooter />
      </div>
    </div>
  );
}

export default StudentResourcePage;
