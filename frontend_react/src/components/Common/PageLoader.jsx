import "../../styles/css/PageLoader.css";

function PageLoader({
  title = "Loading Placement Portal",
  message = "Please wait while we prepare your page.",
}) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader__panel">
        <div className="page-loader__bar" aria-hidden="true">
          <span className="page-loader__bar-track" />
          <span className="page-loader__bar-indicator" />
        </div>
        <div className="page-loader__copy">
          <p className="page-loader__eyebrow">Placement Portal</p>
          <h1>{title}</h1>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}

export default PageLoader;
