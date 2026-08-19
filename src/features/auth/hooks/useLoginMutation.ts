import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useLoginMutation = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            setAuth(data.token, data.user);
            toast.success(`Bienvenido de nuevo, ${data.user.name}`);
            navigate('/dashboard');
        },
    });
};