import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export const useLoginMutation = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            setAuth(data);
            toast.success(`Bienvenido de nuevo, ${data.username}`);
            navigate('/dashboard', { replace: true });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            const serverMessage = error.response?.data?.message;
            if (serverMessage) {
                toast.error(serverMessage);
            } else if (error.response?.status === 401) {
                toast.error('Credenciales incorrectas o cuenta de usuario inactiva.');
            } else if (error.response?.status === 400) {
                toast.error('Datos de inicio de sesión inválidos.');
            } else {
                toast.error('No se pudo conectar con el servidor. Intente nuevamente.');
            }
        },
    });
};