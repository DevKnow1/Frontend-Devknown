import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import type { ApiError } from '../types/api';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().clearSession();
    }

    const normalizedError: ApiError = error.response?.data ?? {
      timestamp: new Date().toISOString(),
      status: status ?? 500,
      error: 'Network Error',
      message: 'No se pudo conectar con el servidor de DevKnow.',
    };

    return Promise.reject(normalizedError);
  }
);