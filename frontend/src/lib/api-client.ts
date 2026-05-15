import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
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

function normalizeError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      return new ApiError({ code: 'TIMEOUT', message: '요청 시간이 초과되었습니다.', status: 0 });
    }
    if (!err.response) {
      return new ApiError({
        code: 'NETWORK_ERROR',
        message: '네트워크 연결을 확인해 주세요.',
        status: 0,
      });
    }
    const body = err.response.data as { error?: ApiErrorBody } | undefined;
    if (body && body.error && typeof body.error.code === 'string') {
      return new ApiError({
        code: body.error.code,
        message: body.error.message,
        status: err.response.status,
        details: body.error.details,
      });
    }
    return new ApiError({
      code: 'UNKNOWN_ERROR',
      message: '알 수 없는 오류가 발생했습니다.',
      status: err.response.status,
    });
  }
  return new ApiError({
    code: 'UNKNOWN_ERROR',
    message: '알 수 없는 오류가 발생했습니다.',
    status: 0,
  });
}

apiClient.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    const apiError = normalizeError(err);
    if (apiError.status === 401) {
      useAuthStore.getState().clearToken();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(apiError);
  },
);
