import Button from "./Button";

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState = ({
  message,
  onRetry,
}: ErrorStateProps) => {

  return (
    <div
      className="shared-error"
      role="alert"
    >

      <h3>
        Something went wrong
      </h3>

      <p>
        {message}
      </p>

      {onRetry && (
        <Button
          variant="danger"
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}

    </div>
  );
};

export default ErrorState;