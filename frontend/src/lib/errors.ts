/**
 * Error handling utilities
 */

import { ApiClientError } from './api-client';

/**
 * Get user-friendly error message from an error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    // Map error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      VALIDATION_ERROR: 'Please check your input and try again',
      UNAUTHORIZED: 'You are not authorized to perform this action',
      FORBIDDEN: 'You do not have permission to perform this action',
      NOT_FOUND: 'The requested resource was not found',
      CONFLICT: 'This action conflicts with the current state',
      NETWORK_ERROR: 'Network error. Please check your connection',
      INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later',
    };

    return errorMessages[error.code] || error.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    return error.code === 'NETWORK_ERROR';
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    return error.code === 'UNAUTHORIZED' || error.statusCode === 401;
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    return error.code === 'VALIDATION_ERROR' || error.statusCode === 400;
  }
  return false;
}
