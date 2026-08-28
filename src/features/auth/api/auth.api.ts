import { apiClient } from '@/lib/axios';
import type { LoginRequestDTO, AuthResponseDTO } from '../types/auth.types';

export const authApi = {
    login: async (credentials: LoginRequestDTO): Promise<AuthResponseDTO> => {
        const response = await apiClient.post<AuthResponseDTO>('/auth/login', credentials);
        return response.data;
    },
};