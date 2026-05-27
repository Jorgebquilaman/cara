import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('cara_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error: string }>) => {
    const message = error.response?.data?.error || error.message;

    if (error.response?.status === 401) {
      localStorage.removeItem('cara_token');
      localStorage.removeItem('cara_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status !== 404) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
