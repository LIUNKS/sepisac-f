import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import type { PageResponse } from '@/types/api';
import type { 
    MachineryResponseDTO, 
    MachineryCreateDTO, 
    MachineryUpdateDTO, 
    MachineryFilterDTO 
} from '../types';
import { toast } from 'sonner';

export const machineryKeys = {
    all: ['machinery'] as const,
    lists: () => [...machineryKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...machineryKeys.lists(), { filters }] as const,
    details: () => [...machineryKeys.all, 'detail'] as const,
    detail: (id: string) => [...machineryKeys.details(), id] as const,
};

// API Functions
export const getMachinery = async (companyId: string | undefined, params: Omit<MachineryFilterDTO, 'companyId'>): Promise<PageResponse<MachineryResponseDTO>> => {
    const safeSearch = (params.search && params.search.trim() !== '') ? params.search : '%';
    
    const body: MachineryFilterDTO = { 
        ...params, 
        page: params.page ?? 0,
        size: params.size ?? 10,
        search: safeSearch,
        companyId 
    };
    const { data } = await apiClient.post<PageResponse<MachineryResponseDTO>>(`/machinery/search`, body);
    return data;
};

export const createMachinery = async (payload: MachineryCreateDTO): Promise<MachineryResponseDTO> => {
    const { data } = await apiClient.post<MachineryResponseDTO>('/machinery', payload);
    return data;
};

export const updateMachinery = async ({ id, payload }: { id: string; payload: MachineryUpdateDTO }): Promise<MachineryResponseDTO> => {
    const { data } = await apiClient.put<MachineryResponseDTO>(`/machinery/${id}`, payload);
    return data;
};

export const changeMachineryStatus = async ({ id, status }: { id: string; status: string }): Promise<MachineryResponseDTO> => {
    const { data } = await apiClient.patch<MachineryResponseDTO>(`/machinery/${id}/status`, { status });
    return data;
};

export const deleteMachinery = async (id: string): Promise<void> => {
    await apiClient.delete(`/machinery/${id}`);
};

// Hooks
export const useMachinery = (companyId: string | undefined, filters: Omit<MachineryFilterDTO, 'companyId'>) => {
    return useQuery({
        queryKey: machineryKeys.list({ companyId, ...filters }),
        queryFn: () => getMachinery(companyId, filters),
    });
};

export const useCreateMachinery = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createMachinery,
        onSuccess: () => {
            toast.success('Maquinaria registrada exitosamente');
            queryClient.invalidateQueries({ queryKey: machineryKeys.lists() });
        },
    });
};

export const useUpdateMachinery = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateMachinery,
        onSuccess: (data) => {
            toast.success('Datos de la maquinaria actualizados');
            queryClient.invalidateQueries({ queryKey: machineryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: machineryKeys.detail(data.id) });
        },
    });
};

export const useChangeMachineryStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: changeMachineryStatus,
        onSuccess: () => {
            toast.success('Estado de la maquinaria actualizado');
            queryClient.invalidateQueries({ queryKey: machineryKeys.lists() });
        },
    });
};

export const useDeleteMachinery = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMachinery,
        onSuccess: () => {
            toast.success('Maquinaria eliminada');
            queryClient.invalidateQueries({ queryKey: machineryKeys.lists() });
        },
    });
};
