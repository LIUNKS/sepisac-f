import { apiClient } from '@/lib/axios';
import type { LoginRequestDTO, AuthResponseDTO } from '../types/auth.types';

export const authApi = {
    login: async (credentials: LoginRequestDTO): Promise<AuthResponseDTO> => {
        const response = await apiClient.post<AuthResponseDTO>('/auth/login', credentials);
        return response.data;
    },
    
    verify2Fa: async (data: { email: string; code: string }): Promise<AuthResponseDTO> => {
        const response = await apiClient.post<AuthResponseDTO>('/auth/verify-2fa', data);
        return response.data;
    },
    toggle2Fa: async (): Promise<{ twoFactorEnabled: boolean }> => {
        const response = await apiClient.post<{ twoFactorEnabled: boolean }>('/auth/2fa/toggle');
        return response.data;
    }
,
    getMe: async (): Promise<AuthResponseDTO> => {
        const response = await apiClient.get<AuthResponseDTO>('/auth/me');
        return response.data;
    }
};
