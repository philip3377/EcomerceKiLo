import {
  StatusCode,
  createApiError,
  createSuccessResponse,
  createErrorResponse,
  getStatusMessage,
  type ApiResponse,
  type ApiError,
} from '../types/api';
import type { Product, Order, CustomerInfo, CartItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return createSuccessResponse<T>(data, response.status as StatusCode);
    }

    let errorBody: { message?: string; details?: string } = {};
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { message: getStatusMessage(response.status as StatusCode) };
    }

    const error: ApiError = createApiError(
      response.status as StatusCode,
      errorBody.message || getStatusMessage(response.status as StatusCode),
      errorBody.details,
      url
    );

    return createErrorResponse<T>(error);
  } catch (err) {
    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    const error: ApiError = createApiError(
      isAbort ? StatusCode.GATEWAY_TIMEOUT : StatusCode.INTERNAL_SERVER_ERROR,
      isAbort ? 'Request timed out' : 'Network error. Please check your connection.',
      err instanceof Error ? err.message : undefined,
      url
    );
    return createErrorResponse<T>(error);
  }
}

export const api = {
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return fetchWithErrorHandling<Product[]>('/products');
  },

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return fetchWithErrorHandling<Product>(`/products/${id}`);
  },

  async createOrder(items: CartItem[], customer: CustomerInfo): Promise<ApiResponse<Order>> {
    return fetchWithErrorHandling<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ items, customer }),
    });
  },

  async getOrders(): Promise<ApiResponse<Order[]>> {
    return fetchWithErrorHandling<Order[]>('/orders');
  },

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return fetchWithErrorHandling<Order>(`/orders/${id}`);
  },

  async validateCoupon(code: string): Promise<ApiResponse<{ valid: boolean; discount: number }>> {
    return fetchWithErrorHandling<{ valid: boolean; discount: number }>(`/coupons/validate`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },
};
