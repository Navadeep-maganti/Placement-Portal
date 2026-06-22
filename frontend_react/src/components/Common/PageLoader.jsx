import "../../styles/css/PageLoader.css";

function PageLoader({
  title = "Loading",
  message = "Please wait while your page is being prepared.",
}) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader__panel">
        <div className="page-loader__spinner" aria-hidden="true">
          <span className="page-loader__spinner-track" />
          <span className="page-loader__spinner-indicator" />
        </div>
        <div className="page-loader__copy">
          <h1>{title}</h1>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}

export default PageLoader;
