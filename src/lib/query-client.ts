import { QueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 2,
            gcTime: 1000 * 60 * 10,
            refetchOnWindowFocus: false,
            retry: (failureCount, error: unknown) => {
                const axiosError = error as AxiosError;
                if (axiosError?.response?.status === 401 || axiosError?.response?.status === 403) {
                    return false;
                }
                return failureCount < 2;
            },
        },
    },
});