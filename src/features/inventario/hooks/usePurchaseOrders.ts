import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPurchaseOrders, createPurchaseOrder, cancelPurchaseOrder, autoGenerateOrders } from '../services/purchase-order.service';
import { toast } from 'sonner';

export const purchaseOrderKeys = {
    all: ['purchase-orders'] as const,
    list: (filters: { page: number; size: number; status?: string; sort?: string }) => [...purchaseOrderKeys.all, 'list', filters] as const,
};

export const usePurchaseOrders = (filters: { page: number; size: number; status?: string; sort?: string }) => {
    return useQuery({
        queryKey: purchaseOrderKeys.list(filters),
        queryFn: () => getPurchaseOrders(filters),
    });
};

export const useCreatePurchaseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPurchaseOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
            toast.success('Orden de compra creada exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al crear orden de compra');
        }
    });
};

export const useCancelPurchaseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelPurchaseOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
            toast.success('Orden de compra cancelada');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al cancelar la orden');
        }
    });
};

export const useAutoGenerateOrders = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: autoGenerateOrders,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
            if (data.generatedOrdersCount > 0) {
                toast.success(`Se generaron ${data.generatedOrdersCount} órdenes de compra automáticas`);
            } else {
                toast.info('No hay ítems críticos para generar órdenes en este momento');
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al autogenerar órdenes');
        }
    });
};
