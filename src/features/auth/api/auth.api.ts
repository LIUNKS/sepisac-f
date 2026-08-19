import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const authApi = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
        return response.data.data;
    },
};