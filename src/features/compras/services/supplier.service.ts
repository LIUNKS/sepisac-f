import { apiClient } from '@/lib/axios';
import type { Supplier, SupplierCreateDTO, SupplierFilterDTO, PageResponse } from '../types';

export const getSuppliers = async (params: SupplierFilterDTO): Promise<PageResponse<Supplier>> => {
    const searchParams = new URLSearchParams();
    if (params.companyId) searchParams.append('companyId', params.companyId);
    searchParams.append('page', params.page.toString());
    searchParams.append('size', params.size.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.sort) searchParams.append('sort', params.sort);

    const response = await apiClient.get('/suppliers', { params: searchParams });
    return response.data;
};

export const createSupplier = async (data: SupplierCreateDTO): Promise<Supplier> => {
    const response = await apiClient.post('/suppliers', data);
    return response.data;
};

export const updateSupplier = async (id: string, data: Partial<SupplierCreateDTO>): Promise<Supplier> => {
    const response = await apiClient.put(`/suppliers/${id}`, data);
    return response.data;
};

export const deleteSupplier = async (id: string): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
};
