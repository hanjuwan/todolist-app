import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { ApiError, type ApiErrorBody } from '@/shared/types';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

function normalizeError(error: AxiosError<ApiErrorBody>): ApiError {
  if (error.response) {
    const status = error.response.status;
    const body = error.response.data;
    if (body && typeof body === 'object' && 'error' in body && body.error) {
      return new ApiError(status, body.error.code, body.error.message, body.error.details);
    }
    return new ApiError(status, 'UNKNOWN_ERROR', error.message);
  }
  if (error.code === 'ECONNABORTED') {
    return new ApiError(0, 'TIMEOUT', '요청 시간이 초과되었습니다.');
  }
  return new ApiError(0, 'NETWORK_ERROR', '네트워크에 연결할 수 없습니다.');
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const normalized = normalizeError(error);
    if (normalized.status === 401) {
      useAuthStore.getState().clearToken();
      redirectToLogin();
    }
    return Promise.reject(normalized);
  },
);
