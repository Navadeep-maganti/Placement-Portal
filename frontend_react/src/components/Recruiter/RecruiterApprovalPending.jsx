import "../../styles/css/RecruiterApprovalPending.css";

function RecruiterApprovalPending({ title, message }) {
  return (
    <main className="rap-page">
      <section className="rap-card">
        <h1>{title}</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}

export default RecruiterApprovalPending;
