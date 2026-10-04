import { apiClient } from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
    InvoiceResponseDTO,
    InvoicePaymentCreateDTO,
    InvoicePaymentResponseDTO,
} from '../types';

export const invoiceKeys = {
    all: ['invoices'] as const,
    lists: () => [...invoiceKeys.all, 'list'] as const,
    list: (status: string) => [...invoiceKeys.lists(), status] as const,
    details: () => [...invoiceKeys.all, 'detail'] as const,
    detail: (id: string) => [...invoiceKeys.details(), id] as const,
    payments: (id: string) => [...invoiceKeys.detail(id), 'payments'] as const,
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

export const generateInvoiceFromQuotation = async (quotationId: string): Promise<InvoiceResponseDTO> => {
    const { data } = await apiClient.post<InvoiceResponseDTO>(`/invoices/from-quotation/${quotationId}`);
    return data;
};

// Hooks
export const useInvoices = (status: string, companyId?: string) => {
    return useQuery({
        queryKey: [...invoiceKeys.list(status), companyId],
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
        onSuccess: (_, variables) => {
            toast.success('Pago registrado exitosamente');
            queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: invoiceKeys.payments(variables.id) });
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al registrar el pago');
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

