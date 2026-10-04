import axios, { AxiosError } from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/app/store/useAuthStore';
import { toast } from 'sonner';
import type { ApiErrorResponse } from '@/types/api';

export const apiClient = axios.create({
    baseURL: env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
        const status = error.response?.status;
        const data = error.response?.data;
        const requestUrl = error.config?.url ?? '';
        const isAuthLoginRequest = requestUrl.includes('/auth/login');

        if (status === 401 && !isAuthLoginRequest) {
            toast.error('Sesión expirada o no autorizada');
            useAuthStore.getState().logout();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (status === 403) {
            toast.error('Acceso denegado: No tienes permisos suficientes');
        } else if (status === 500) {
            toast.error('Error interno del servidor. Contacte al administrador.');
        } else if (!isAuthLoginRequest && data?.message) {
            toast.error(data.message);
        } else if (!error.response) {
            toast.error('Error de conexión con el servidor');
        }

        return Promise.reject(error);
    }
);