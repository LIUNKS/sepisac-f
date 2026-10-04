import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/app/store/useAuthStore';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: authApi.login,
        onError: (error: AxiosError<ApiErrorResponse>) => {
            const serverMessage = error.response?.data?.message;
            if (serverMessage) {
                toast.error(serverMessage);
            } else if (error.response?.status === 401) {
                toast.error('Credenciales incorrectas o cuenta inactiva.');
            } else if (error.response?.status === 400) {
                toast.error('Datos de inicio de sesión inválidos.');
            } else {
                toast.error('No se pudo conectar con el servidor. Intente nuevamente.');
            }
        },
    });
};

export const useVerify2FaMutation = () => {
    return useMutation({
        mutationFn: authApi.verify2Fa,
        onError: (error: AxiosError<ApiErrorResponse>) => {
            const serverMessage = error.response?.data?.message;
            if (serverMessage) {
                toast.error(serverMessage);
            } else if (error.response?.status === 401) {
                toast.error('Código incorrecto o expirado.');
            } else {
                toast.error('Error al verificar el código.');
            }
        },
    });
};

export const useToggle2FaMutation = () => {
    const updateUser = useAuthStore(state => state.updateUser);
    return useMutation({
        mutationFn: authApi.toggle2Fa,
        onSuccess: (data) => {
            updateUser({ twoFactorEnabled: data.twoFactorEnabled });
            toast.success(data.twoFactorEnabled ? 'Autenticación de 2 Factores ACTIVADA' : 'Autenticación de 2 Factores DESACTIVADA');
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error(error.response?.data?.message || 'Error al cambiar la configuración de 2FA.');
        }
    });
};