import { apiClient } from '@/lib/axios';
import type { DashboardData } from '../types';

export const getDashboardData = async (companyId: string): Promise<DashboardData> => {
    const response = await apiClient.get(`/dashboard/${companyId}`);
    return response.data;
};

export const seedDashboardData = async (companyId: string): Promise<void> => {
    await apiClient.post(`/dashboard/${companyId}/seed`);
};
