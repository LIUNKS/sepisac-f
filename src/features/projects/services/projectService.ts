import { apiClient } from '@/lib/axios';
import type { Project, ProjectsResponse } from '../types';

export const getProjects = async (companyId?: string, page = 0, size = 10, search = ''): Promise<ProjectsResponse> => {
    const params: Record<string, any> = { page, size, search: search || undefined };
    if (companyId) {
        params.companyId = companyId;
    }
    const response = await apiClient.get('/projects', { params });
    return response.data;
};

export const getProject = async (id: string): Promise<Project> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
};

export const createProject = async (data: Partial<Project>): Promise<Project> => {
    const response = await apiClient.post('/projects', data);
    return response.data;
};

export const updateProject = async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
};

export const seedProjects = async (companyId: string): Promise<void> => {
    await apiClient.post(`/projects/seed/${companyId}`);
};

export const createProjectFromQuotation = async (quotationId: string): Promise<Project> => {
    const response = await apiClient.post(`/projects/from-quotation/${quotationId}`);
    return response.data;
};

export const assignEmployee = async (id: string, data: any): Promise<any> => {
    const response = await apiClient.post(`/projects/${id}/assignments`, data);
    return response.data;
};

export const assignMachinery = async (id: string, data: any): Promise<any> => {
    const response = await apiClient.post(`/projects/${id}/machinery-assignments`, data);
    return response.data;
};

export const consumeInventory = async (id: string, data: { inventoryItemId: string; quantity: number; reason?: string }): Promise<any> => {
    const response = await apiClient.post(`/projects/${id}/inventory-consumptions`, data);
    return response.data;
};

export const updateProjectStatus = async (id: string, status: string): Promise<Project> => {
    const response = await apiClient.put(`/projects/${id}/status`, { status });
    return response.data;
};
