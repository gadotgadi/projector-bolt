// API utility functions for making authenticated requests

const API_BASE_URL = 'http://localhost:3001/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const makeAuthenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};

export const apiRequest = {
  get: (endpoint: string) => makeAuthenticatedRequest(endpoint, { method: 'GET' }),
  post: (endpoint: string, data: any) => 
    makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: (endpoint: string, data: any) => 
    makeAuthenticatedRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (endpoint: string) => makeAuthenticatedRequest(endpoint, { method: 'DELETE' }),
};

// Check if user is authenticated by verifying token with server
export const verifyToken = async (): Promise<boolean> => {
  try {
    const response = await makeAuthenticatedRequest('/auth/me');
    return response.ok;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};