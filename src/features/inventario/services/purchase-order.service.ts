import { apiClient } from '@/lib/axios';
import type { PurchaseOrder, CreatePurchaseOrder, AutoGenerateOrdersResponse } from '../types/purchase-order';
import type { PageResponse } from '@/types/api';

export const getPurchaseOrders = async (params: { page: number; size: number; status?: string; sort?: string }): Promise<PageResponse<PurchaseOrder>> => {
    const searchParams = new URLSearchParams();
    searchParams.append('page', params.page.toString());
    searchParams.append('size', params.size.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.sort) searchParams.append('sort', params.sort);

    const response = await apiClient.get('/purchase-orders', { params: searchParams });
    return response.data;
};

export const createPurchaseOrder = async (data: CreatePurchaseOrder): Promise<PurchaseOrder> => {
    const response = await apiClient.post('/purchase-orders', data);
    return response.data;
};

export const cancelPurchaseOrder = async (id: string): Promise<PurchaseOrder> => {
    const response = await apiClient.patch(`/purchase-orders/${id}/cancel`);
    return response.data;
};

export const autoGenerateOrders = async (companyId?: string): Promise<AutoGenerateOrdersResponse> => {
    const url = companyId ? `/purchase-orders/auto-generate?companyId=${companyId}` : '/purchase-orders/auto-generate';
    const response = await apiClient.post(url);
    return response.data;
};
