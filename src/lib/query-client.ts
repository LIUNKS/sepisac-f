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
                const status = axiosError?.response?.status;
                if (status && [400, 401, 403, 404].includes(status)) {
                    return false;
                }
                return failureCount < 2;
            },
        },
    },
});