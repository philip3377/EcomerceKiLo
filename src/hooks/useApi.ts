import { useState, useCallback } from 'react';
import type { ApiResponse, ApiError } from '../types/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  statusCode: number | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<ApiResponse<T>>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<ApiResponse<T>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    statusCode: null,
  });

  const execute = useCallback(
    async (...args: unknown[]): Promise<ApiResponse<T>> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await apiFunction(...args);

      setState({
        data: response.data,
        loading: false,
        error: response.error,
        statusCode: response.statusCode,
      });

      return response;
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      statusCode: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
