import api from '@/lib/axios';
import { Project, ProjectsResponse } from '../types';

export const getProjects = async (companyId: string, page = 0, size = 10, search = ''): Promise<ProjectsResponse> => {
    const response = await api.get(`/projects/company/${companyId}`, {
        params: { page, size, search: search || undefined }
    });
    return response.data;
};

export const getProject = async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
};

export const createProject = async (data: Partial<Project>): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
};

export const updateProject = async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
};
