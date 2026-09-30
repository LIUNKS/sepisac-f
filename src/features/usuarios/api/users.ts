import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import type { PageResponse } from '@/types/api';
import type { 
    UserResponseDTO, 
    UserCreateDTO, 
    UserUpdateDTO, 
    UserFilterDTO 
} from '../types';
import { toast } from 'sonner';

// --- Query Keys Factory ---
export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...userKeys.lists(), { filters }] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
};

// --- API Functions ---
export const getUsers = async (companyId: string | undefined, params: Omit<UserFilterDTO, 'companyId'>): Promise<PageResponse<UserResponseDTO>> => {
    // Si hay companyId, lo inyectamos al body de búsqueda.
    // HACK: El backend (UserService.java) convierte strings vacíos ("") a null,
    // lo que causa que Postgres crashee con "lower(bytea) does not exist".
    // Para evitar que el backend lo convierta a null, enviamos "%" cuando
    // el usuario no busca nada (o busca solo espacios). "%" funciona como comodín universal.
    const safeSearch = (params.search && params.search.trim() !== '') ? params.search : '%';
    
    const body: UserFilterDTO = { 
        ...params, 
        search: safeSearch,
        companyId 
    };
    const { data } = await apiClient.post<PageResponse<UserResponseDTO>>(`/users/search`, body);
    return data;
};

export const createUser = async (payload: UserCreateDTO): Promise<UserResponseDTO> => {
    const { data } = await apiClient.post<UserResponseDTO>('/users', payload);
    return data;
};

export const updateUser = async ({ id, payload }: { id: string; payload: UserUpdateDTO }): Promise<UserResponseDTO> => {
    const { data } = await apiClient.put<UserResponseDTO>(`/users/${id}`, payload);
    return data;
};

export const toggleUserStatus = async (id: string): Promise<UserResponseDTO> => {
    const { data } = await apiClient.patch<UserResponseDTO>(`/users/${id}/toggle-status`);
    return data;
};

// --- Hooks ---
export const useUsers = (companyId: string | undefined, filters: Omit<UserFilterDTO, 'companyId'>) => {
    return useQuery({
        queryKey: userKeys.list({ companyId, ...filters }),
        queryFn: () => getUsers(companyId, filters),
        // quitamos el enabled: !!companyId para que busque igual a nivel global si es superadmin
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            toast.success('Usuario creado exitosamente');
            // Invalidamos las listas para que la tabla se recargue sola
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateUser,
        onSuccess: (data) => {
            toast.success('Usuario actualizado exitosamente');
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
        },
    });
};

export const useToggleUserStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: toggleUserStatus,
        onSuccess: () => {
            toast.success('Estado del usuario actualizado');
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
};
