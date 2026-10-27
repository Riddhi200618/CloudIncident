/**
 * Centralized API Client and Configuration
 * Handles communication with AWS API Gateway endpoint
 */

const env = (typeof import.meta !== 'undefined' && import.meta.env) || (typeof process !== 'undefined' && process.env) || {};
export const API_BASE_URL = env.VITE_API_BASE_URL || '';
export const USE_MOCK_DATA = env.VITE_USE_MOCK_DATA !== 'false';

/**
 * Low-level API caller for AWS API Gateway routes
 */
export async function apiClient(endpoint, options = {}) {
  const baseUrl = (API_BASE_URL || '').replace(/\/+$/, '');
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const url = baseUrl ? `${baseUrl}/${cleanEndpoint}` : `/${cleanEndpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let responseData = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json') || response.status !== 204) {
    try {
      responseData = await response.json();
    } catch {
      // Non-JSON response
    }
  }

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} ${response.statusText}`;
    if (responseData && typeof responseData === 'object') {
      errorDetail = responseData.message || responseData.errorMessage || responseData.error || errorDetail;
    }
    const error = new Error(errorDetail);
    error.status = response.status;
    error.data = responseData;
    throw error;
  }

  // Handle empty 204 responses
  if (response.status === 204 || responseData === null) {
    return null;
  }

  // Handle { success: false } in 200 OK responses
  if (responseData && typeof responseData === 'object' && responseData.success === false) {
    const error = new Error(responseData.message || 'Request was unsuccessful');
    error.status = response.status;
    error.data = responseData;
    throw error;
  }

  return responseData;
}
