import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

export const api = axios.create({
  // Le backend monte toutes ses routes sous /api
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré/invalide : on nettoie et on revient à l'accueil (la connexion se fait via modale)
      Cookies.remove('auth_token');
      Cookies.remove('refresh_token');
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  logout: () =>
    api.post('/auth/logout'),
};

// Startup services (les startups sont exposées sous /api/investments/startups)
export const startupService = {
  getAll: (params?: any) =>
    api.get('/investments/startups', { params }),

  getById: (id: string) =>
    api.get(`/investments/startups/${id}`),
};

