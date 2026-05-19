import { useAppContext } from '../context/AppContext';
import { isClientError, isServerError, type ApiError } from '../types/api';

function getStatusClass(error: ApiError): string {
  if (isClientError(error.statusCode)) return 'error-notification--client';
  if (isServerError(error.statusCode)) return 'error-notification--server';
  return 'error-notification--network';
}

function getStatusLabel(error: ApiError): string {
  if (isClientError(error.statusCode)) return 'Client Error';
  if (isServerError(error.statusCode)) return 'Server Error';
  return 'Network Error';
}

export default function ErrorNotification() {
  const { state, dispatch } = useAppContext();

  if (!state.error) return null;

  const error = state.error;

  return (
    <div className={`error-notification ${getStatusClass(error)}`} role="alert">
      <div className="error-notification__header">
        <span className="error-notification__badge">{error.statusCode}</span>
        <span className="error-notification__label">{getStatusLabel(error)}</span>
        <button
          className="error-notification__close"
          onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
          aria-label="Dismiss error"
        >
          &times;
        </button>
      </div>
      <p className="error-notification__message">{error.message}</p>
      {error.details && (
        <p className="error-notification__details">{error.details}</p>
      )}
      {error.path && (
        <p className="error-notification__path">Endpoint: {error.path}</p>
      )}
      <p className="error-notification__timestamp">
        {new Date(error.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
}
