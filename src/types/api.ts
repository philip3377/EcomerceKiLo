export const StatusCode = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type StatusCode = (typeof StatusCode)[keyof typeof StatusCode];

export interface ApiError {
  statusCode: StatusCode;
  message: string;
  details?: string;
  timestamp: string;
  path?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: StatusCode;
  data: T | null;
  error: ApiError | null;
}

export function createApiError(
  statusCode: StatusCode,
  message: string,
  details?: string,
  path?: string
): ApiError {
  return {
    statusCode,
    message,
    details,
    timestamp: new Date().toISOString(),
    path,
  };
}

export function createSuccessResponse<T>(data: T, statusCode: StatusCode = StatusCode.OK): ApiResponse<T> {
  return {
    success: true,
    statusCode,
    data,
    error: null,
  };
}

export function createErrorResponse<T>(error: ApiError): ApiResponse<T> {
  return {
    success: false,
    statusCode: error.statusCode,
    data: null,
    error,
  };
}

export function getStatusMessage(code: StatusCode): string {
  const messages: Record<number, string> = {
    [StatusCode.OK]: 'Request completed successfully',
    [StatusCode.CREATED]: 'Resource created successfully',
    [StatusCode.NO_CONTENT]: 'No content',
    [StatusCode.BAD_REQUEST]: 'Invalid request. Please check your input.',
    [StatusCode.UNAUTHORIZED]: 'Authentication required. Please log in.',
    [StatusCode.FORBIDDEN]: 'You do not have permission to perform this action.',
    [StatusCode.NOT_FOUND]: 'The requested resource was not found.',
    [StatusCode.CONFLICT]: 'A conflict occurred with the current state.',
    [StatusCode.UNPROCESSABLE_ENTITY]: 'Validation failed. Please check your data.',
    [StatusCode.TOO_MANY_REQUESTS]: 'Too many requests. Please try again later.',
    [StatusCode.INTERNAL_SERVER_ERROR]: 'An internal server error occurred. Please try again.',
    [StatusCode.BAD_GATEWAY]: 'Bad gateway. The server is unreachable.',
    [StatusCode.SERVICE_UNAVAILABLE]: 'Service unavailable. Please try again later.',
    [StatusCode.GATEWAY_TIMEOUT]: 'Request timed out. Please try again.',
  };
  return messages[code] || 'An unknown error occurred.';
}

export function isClientError(code: StatusCode): boolean {
  return code >= 400 && code < 500;
}

export function isServerError(code: StatusCode): boolean {
  return code >= 500;
}
