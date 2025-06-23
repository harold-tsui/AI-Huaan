const API_BASE_URL = '/api'; // Assuming the Vite proxy is configured

/**
 * Fetches data from the backend.
 * @param endpoint The API endpoint to call.
 * @returns The JSON response from the server.
 */
export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${endpoint}: ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  },

  /**
   * Posts data to the backend.
   * @param endpoint The API endpoint to call.
   * @param data The data to send in the request body.
   * @returns The JSON response from the server.
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to post to ${endpoint}: ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  },
};