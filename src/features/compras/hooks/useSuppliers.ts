import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/supplier.service';
import type { SupplierFilterDTO, SupplierCreateDTO } from '../types';
import { toast } from 'sonner';

export const supplierKeys = {
    all: ['suppliers'] as const,
    list: (filters: SupplierFilterDTO) => [...supplierKeys.all, 'list', filters] as const,
};

export const useSuppliers = (filters: SupplierFilterDTO) => {
    return useQuery({
        queryKey: supplierKeys.list(filters),
        queryFn: () => getSuppliers(filters),
    });
};

export const useCreateSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createSupplier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: supplierKeys.all });
            toast.success('Proveedor creado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al crear proveedor');
        }
    });
};

export const useUpdateSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<SupplierCreateDTO> }) => updateSupplier(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: supplierKeys.all });
            toast.success('Proveedor actualizado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar proveedor');
        }
    });
};

export const useDeleteSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSupplier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: supplierKeys.all });
            toast.success('Proveedor eliminado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al eliminar proveedor');
        }
    });
};
