import { API_URL } from '../config/constants';

export interface HealthResponse {
  status: string;
  timestamp?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await fetch(`${API_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Appel POST JSON vers /api/* avec gestion d'erreur homogène (enveloppe { success, data, message }).
async function postJson(path: string, body: unknown): Promise<any> {
  const response = await fetch(`${API_URL}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.success === false) {
    throw new Error(json.message || `Erreur ${response.status}`);
  }
  return json.data;
}

export const login = (email: string, password: string): Promise<AuthResult> =>
  postJson('/auth/login', { email, password });

export const register = (data: { name: string; email: string; password: string }): Promise<AuthResult> =>
  postJson('/auth/register', data);
