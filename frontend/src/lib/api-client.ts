/**
 * API client for backend requests
 * Handles authentication, business context, and error formatting
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
}

export class ApiClientError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export interface RequestOptions extends RequestInit {
  businessId?: string;
  token?: string;
}

/**
 * Make an API request with authentication and business context
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { businessId, token, ...fetchOptions } = options;

  const url = `${API_URL}/api/v1${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Add authentication token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('API request with token:', { endpoint, tokenLength: token.length, tokenPrefix: token.substring(0, 20) + '...' });
  } else {
    console.warn('API request made without authentication token:', { endpoint, hasBusinessId: !!businessId });
  }

  // Add business context
  if (businessId) {
    headers['X-Business-Id'] = businessId;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle empty responses (e.g., 204 No Content for DELETE)
    if (response.status === 204) {
      return undefined as T;
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    const hasJsonContent = contentType && contentType.includes('application/json');
    
    let data;
    if (hasJsonContent) {
      try {
        data = await response.json();
      } catch (e) {
        // If JSON parsing fails, return undefined
        if (response.ok) {
          return undefined as T;
        }
        throw new ApiClientError('Invalid JSON response', 'INVALID_RESPONSE', response.status);
      }
    } else {
      // No JSON content, but response might be OK (e.g., 201 with no body)
      if (response.ok) {
        return undefined as T;
      }
      // If not OK and no JSON, create error
      throw new ApiClientError(`Request failed with status ${response.status}`, 'HTTP_ERROR', response.status);
    }

    if (!response.ok) {
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        throw new ApiClientError(
          'Authentication failed. Please sign in again.',
          'UNAUTHORIZED',
          401
        );
      }

      const error = data.error || { code: 'UNKNOWN_ERROR', message: 'An error occurred' };
      throw new ApiClientError(error.message, error.code, response.status);
    }

    // Return data from standard response format: { data: ... }
    // For DELETE (204), data might be null/undefined
    if (data === null || data === undefined) {
      return undefined as T;
    }
    return data.data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Network or other errors
    throw new ApiClientError(
      error instanceof Error ? error.message : 'Network error',
      'NETWORK_ERROR'
    );
  }
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request
 */
export async function apiPatch<T>(
  endpoint: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}
