import { API_URL } from '../config/constants';

export interface HealthResponse {
  status: string;
  timestamp?: string;
}

export const checkHealth = async (): Promise<HealthResponse> => {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to check health: ${error}`);
  }
};
