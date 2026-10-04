import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { authKeys } from './authKeys';
import { useAuthStore } from '@/app/store/useAuthStore';

export const useMeQuery = () => {
    const { isAuthenticated, setAuth } = useAuthStore();

    return useQuery({
        queryKey: authKeys.profile(),
        queryFn: async () => {
            const data = await authApi.getMe();
            setAuth(data); // Sync local store with fresh data (including fullName)
            return data;
        },
        enabled: isAuthenticated, // Only fetch if user is supposedly logged in
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
