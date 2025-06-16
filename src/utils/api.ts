// API utility functions for making authenticated requests
// COMMENTED OUT - Using mock data instead

const API_BASE_URL = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// MOCK IMPLEMENTATION - Replace with real API calls when server is ready
export const makeAuthenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  // For now, return mock responses
  console.log('Mock API call to:', endpoint, options);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return mock success response
  return new Response(JSON.stringify({ success: true, data: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
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

// Check if user is authenticated by checking mock token
export const verifyToken = async (): Promise<boolean> => {
  try {
    const token = getAuthToken();
    return !!token && token.startsWith('mock-token-');
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

/*
// REAL API IMPLEMENTATION - Uncomment when server is ready
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

export const verifyToken = async (): Promise<boolean> => {
  try {
    const response = await makeAuthenticatedRequest('/auth/me');
    return response.ok;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};
*/