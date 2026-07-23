import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const instance = axios.create({
  baseURL: API_BASE_URL,
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    // Check token expiry before sending
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 <= Date.now()) {
        // Token expired — clear auth and redirect
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = '/login';
        return Promise.reject(new Error('Token expired'));
      }
    } catch {
      // Malformed token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = '/login';
      return Promise.reject(new Error('Invalid token'));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token invalid/expired — clear auth and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Avoid redirect loop if already on login page
      if (window.location.pathname !== '/login' && 
          window.location.pathname !== '/participant-login' &&
          window.location.pathname !== '/participant-signup' &&
          window.location.pathname !== '/forgot-password') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
