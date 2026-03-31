import "../../styles/css/RecruiterToast.css";

function RecruiterToast({ toast, modalOpen = false }) {
  if (!toast?.message) {
    return null;
  }

  return (
    <div
      className={`rt-toast rt-toast-${toast.type || "success"} ${
        modalOpen ? "rt-toast-modal-open" : ""
      }`}
      role="status"
      aria-live="polite"
    >
      {toast.message}
    </div>
  );
}

export default RecruiterToast;
