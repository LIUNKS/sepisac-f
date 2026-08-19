import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/app/store/useAuthStore';
import { toast } from 'sonner';
import type { ApiErrorResponse } from '@/types/api';

export const apiClient = axios.create({
    baseURL: env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().token;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 401) {
            toast.error('Sesión expirada o no autorizada');
            useAuthStore.getState().logout();
            window.location.href = '/login';
        } else if (status === 403) {
            toast.error('Acceso denegado: No tienes permisos suficientes');
        } else if (status === 500) {
            toast.error('Error interno del servidor. Contacte al administrador.');
        } else if (data?.message) {
            toast.error(data.message);
        } else {
            toast.error('Error de conexión con el servidor');
        }

        return Promise.reject(error);
    }
);