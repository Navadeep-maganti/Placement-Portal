import "../../styles/css/StudentModal.css";

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="sm-overlay" role="dialog" aria-modal="true">
      <div className="sm-panel sm-panel-compact">
        <div className="sm-header">
          <div>
            <p className="sm-eyebrow">Confirmation</p>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <div className="sm-actions sm-actions-end">
          <button type="button" className="sm-secondary-btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`sm-primary-btn ${tone}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
