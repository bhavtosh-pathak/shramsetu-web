import axios from 'axios';
import { storage, TOKEN_KEY, clearSession } from '../utils/storage';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7000/api', timeout: 15000 });

api.interceptors.request.use(config => {
  const token = storage.get(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(response => response, error => {
  const status = error.response?.status;
  const url = String(error.config?.url || '');
  const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register');
  if (status === 401 && !isAuthCall) {
    clearSession();
    if (!['/login', '/register', '/'].includes(window.location.pathname)) window.location.assign('/login');
  }
  return Promise.reject(error);
});

export const getError = error => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ECONNABORTED') return 'Server is taking too long to respond. Please try again.';
  if (error?.request && !error?.response) return 'Cannot reach the server. Check that the backend is running and CLIENT_URL / VITE_API_URL are correct.';
  return error?.message || 'Something went wrong. Please try again.';
};
export default api;
