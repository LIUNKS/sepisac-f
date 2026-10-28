import { apiClient } from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
    InvoiceResponseDTO,
    InvoicePaymentCreateDTO,
    InvoicePaymentResponseDTO,
} from '../types';
import type { PageResponse } from '@/types/api';

export const invoiceKeys = {
    all: ['invoices'] as const,
    lists: () => [...invoiceKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...invoiceKeys.lists(), filters] as const,
    details: () => [...invoiceKeys.all, 'detail'] as const,
    detail: (id: string) => [...invoiceKeys.details(), id] as const,
    payments: (id: string) => [...invoiceKeys.detail(id), 'payments'] as const,
};

export interface SearchInvoicesParams {
    companyId?: string;
    status?: string;
    search?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export const searchInvoices = async (params: SearchInvoicesParams = {}): Promise<PageResponse<InvoiceResponseDTO>> => {
    const { data } = await apiClient.post<PageResponse<InvoiceResponseDTO>>('/invoices/search', {
        page: params.page ?? 0,
        size: params.size ?? 1000,
        sort: params.sort ?? 'createdAt,desc',
        companyId: params.companyId,
        status: params.status,
        search: params.search,
    });
    return data;
};

export const getInvoicesByStatus = async (status: string, companyId?: string): Promise<InvoiceResponseDTO[]> => {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    const { data } = await apiClient.get<InvoiceResponseDTO[]>(`/invoices/status/${status}`, { params });
    return data;
};

export const getInvoicePayments = async (id: string): Promise<InvoicePaymentResponseDTO[]> => {
    const { data } = await apiClient.get<InvoicePaymentResponseDTO[]>(`/invoices/${id}/payments`);
    return data;
};

export const registerPayment = async ({ id, payload }: { id: string; payload: InvoicePaymentCreateDTO }): Promise<InvoicePaymentResponseDTO> => {
    const { data } = await apiClient.post<InvoicePaymentResponseDTO>(`/invoices/${id}/payments`, payload);
    return data;
};

export const cancelInvoice = async ({ id, reason }: { id: string; reason?: string }): Promise<InvoiceResponseDTO> => {
    const { data } = await apiClient.post<InvoiceResponseDTO>(`/invoices/${id}/cancel`, { reason });
    return data;
};

export const generateInvoiceFromQuotation = async (quotationId: string): Promise<InvoiceResponseDTO> => {
    const { data } = await apiClient.post<InvoiceResponseDTO>(`/invoices/from-quotation/${quotationId}`);
    return data;
};

// Hooks
export const useSearchInvoices = (params: SearchInvoicesParams = {}) => {
    return useQuery({
        queryKey: invoiceKeys.list(params),
        queryFn: () => searchInvoices(params),
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useInvoices = (status: string, companyId?: string) => {
    return useQuery({
        queryKey: invoiceKeys.list({ status, companyId }),
        queryFn: () => getInvoicesByStatus(status, companyId),
    });
};

export const useInvoicePayments = (id: string, enabled: boolean) => {
    return useQuery({
        queryKey: invoiceKeys.payments(id),
        queryFn: () => getInvoicePayments(id),
        enabled,
    });
};

export const useRegisterPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: registerPayment,
        onSuccess: () => {
            toast.success('Pago registrado exitosamente');
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al registrar el pago');
        }
    });
};

export const useCancelInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelInvoice,
        onSuccess: () => {
            toast.success('Factura anulada exitosamente');
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al anular la factura');
        }
    });
};

export const useGenerateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: generateInvoiceFromQuotation,
        onSuccess: () => {
            toast.success('Factura generada exitosamente');
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al generar la factura');
        }
    });
};
