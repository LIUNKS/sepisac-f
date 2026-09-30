import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import type { PageResponse } from '@/types/api';
import type { 
    EmployeeResponseDTO, 
    EmployeeCreateDTO, 
    EmployeeUpdateDTO, 
    EmployeeFilterDTO 
} from '../types';
import { toast } from 'sonner';

export const employeeKeys = {
    all: ['employees'] as const,
    lists: () => [...employeeKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...employeeKeys.lists(), { filters }] as const,
    details: () => [...employeeKeys.all, 'detail'] as const,
    detail: (id: string) => [...employeeKeys.details(), id] as const,
};

// API Functions
export const getEmployees = async (companyId: string | undefined, params: Omit<EmployeeFilterDTO, 'companyId'>): Promise<PageResponse<EmployeeResponseDTO>> => {
    const safeSearch = (params.search && params.search.trim() !== '') ? params.search : '%';
    
    const body: EmployeeFilterDTO = { 
        ...params, 
        search: safeSearch,
        companyId 
    };
    const { data } = await apiClient.post<PageResponse<EmployeeResponseDTO>>(`/employees/search`, body);
    return data;
};

export const createEmployee = async (payload: EmployeeCreateDTO): Promise<EmployeeResponseDTO> => {
    const { data } = await apiClient.post<EmployeeResponseDTO>('/employees', payload);
    return data;
};

export const updateEmployee = async ({ id, payload }: { id: string; payload: EmployeeUpdateDTO }): Promise<EmployeeResponseDTO> => {
    const { data } = await apiClient.put<EmployeeResponseDTO>(`/employees/${id}`, payload);
    return data;
};

export const toggleEmployeeStatus = async (id: string): Promise<EmployeeResponseDTO> => {
    const { data } = await apiClient.patch<EmployeeResponseDTO>(`/employees/${id}/toggle-availability`);
    return data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
};

// Hooks
export const useEmployees = (companyId: string | undefined, filters: Omit<EmployeeFilterDTO, 'companyId'>) => {
    return useQuery({
        queryKey: employeeKeys.list({ companyId, ...filters }),
        queryFn: () => getEmployees(companyId, filters),
    });
};

export const useCreateEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createEmployee,
        onSuccess: () => {
            toast.success('Empleado registrado exitosamente');
            queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
        },
    });
};

export const useUpdateEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateEmployee,
        onSuccess: (data) => {
            toast.success('Datos del empleado actualizados');
            queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
            queryClient.invalidateQueries({ queryKey: employeeKeys.detail(data.id) });
        },
    });
};

export const useToggleEmployeeStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: toggleEmployeeStatus,
        onSuccess: () => {
            toast.success('Disponibilidad del empleado actualizada');
            queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
        },
    });
};

export const useDeleteEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteEmployee,
        onSuccess: () => {
            toast.success('Empleado eliminado');
            queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
        },
    });
};
