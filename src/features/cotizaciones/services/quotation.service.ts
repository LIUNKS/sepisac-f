import { apiClient } from '@/lib/axios';
import type { Quotation, QuotationsResponse } from '../types';

export const getQuotations = async (companyId?: string, page = 0, size = 100, search?: string): Promise<QuotationsResponse> => {
    const safeSearch = (search && search.trim() !== '') ? search : '%';
    const params: Record<string, any> = { page, size, search: safeSearch };
    
    if (companyId) {
        params.companyId = companyId;
    }
    
    const response = await apiClient.get('/quotations', { params });
    return response.data;
};

export const getQuotationById = async (id: string): Promise<Quotation> => {
    const response = await apiClient.get(`/quotations/${id}`);
    return response.data;
};

export const updateQuotation = async (id: string, data: any): Promise<Quotation> => {
    const response = await apiClient.put(`/quotations/${id}`, data);
    return response.data;
};

export const updateQuotationStatus = async (id: string, status: string): Promise<Quotation> => {
    const response = await apiClient.patch(`/quotations/${id}/status`, { status });
    return response.data;
};
