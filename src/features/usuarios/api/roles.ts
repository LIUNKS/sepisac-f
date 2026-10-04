import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';
import type { RoleResponseDTO } from '../types';

export interface RoleCreateDTO {
    name: string;
    description?: string;
}

export const roleKeys = {
    all: ['roles'] as const,
};

export const getRoles = async (): Promise<RoleResponseDTO[]> => {
    const { data } = await apiClient.get<RoleResponseDTO[]>('/roles');
    return data;
};

export const createRole = async (payload: RoleCreateDTO): Promise<RoleResponseDTO> => {
    const { data } = await apiClient.post<RoleResponseDTO>('/roles', payload);
    return data;
};

export const useRoles = () => {
    return useQuery({
        queryKey: roleKeys.all,
        queryFn: getRoles,
    });
};

export const useCreateRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
            toast.success('Rol creado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al crear el rol');
        }
    });
};
