import "../../styles/css/RecruiterApprovalPending.css";
import RecruiterFooter from "../Footer/RecruiterFooter";

function RecruiterApprovalPending({ title, message }) {
  return (
    <>
      <main className="rap-page">
        <section className="rap-card">
          <h1>{title}</h1>
          <p>{message}</p>
        </section>
      </main>
      <RecruiterFooter />
    </>
  );
}

export default RecruiterApprovalPending;
