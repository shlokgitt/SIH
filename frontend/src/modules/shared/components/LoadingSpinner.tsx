export interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({
  message = "Loading...",
}: LoadingSpinnerProps) => {

  return (
    <div
      className="shared-loading"
      role="status"
      aria-live="polite"
    >

      <div className="shared-spinner" />

      <p>{message}</p>

    </div>
  );
};

export default LoadingSpinner;