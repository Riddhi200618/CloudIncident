/**
 * Centralized API Client and Configuration
 * Handles communication with AWS API Gateway endpoint
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com/prod';
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

/**
 * Low-level API caller for future AWS API Gateway routes
 */
export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.message || errorJson.error || errorDetail;
    } catch {
      // Non-JSON error payload
    }
    const error = new Error(errorDetail);
    error.status = response.status;
    throw error;
  }

  // Handle empty 204 responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
