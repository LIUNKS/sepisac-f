import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import type { PageResponse } from '@/types/api';
import type { 
    CompanyResponseDTO, 
    CompanyCreateDTO, 
    CompanyFilterDTO 
} from '../types';
import { toast } from 'sonner';

// --- Query Keys Factory ---
export const companyKeys = {
    all: ['companies'] as const,
    lists: () => [...companyKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...companyKeys.lists(), { filters }] as const,
    details: () => [...companyKeys.all, 'detail'] as const,
    detail: (id: string) => [...companyKeys.details(), id] as const,
};

// --- API Functions ---
export const getCompanies = async (params: CompanyFilterDTO): Promise<PageResponse<CompanyResponseDTO>> => {
    // Similar to users, if search is empty, send '%' to prevent backend from crashing
    // if there is a similar bug in company search
    const safeSearch = (params.search && params.search.trim() !== '') ? params.search : '%';
    
    const body: CompanyFilterDTO = { 
        ...params, 
        page: params.page ?? 0,
        size: params.size ?? 10,
        search: safeSearch
    };
    const { data } = await apiClient.post<PageResponse<CompanyResponseDTO>>(`/companies/search`, body);
    return data;
};

export const createCompany = async (payload: CompanyCreateDTO): Promise<CompanyResponseDTO> => {
    const { data } = await apiClient.post<CompanyResponseDTO>('/companies', payload);
    return data;
};

// --- Hooks ---
export const useCompanies = (filters: CompanyFilterDTO, enabled: boolean = true) => {
    return useQuery({
        queryKey: companyKeys.list(filters),
        queryFn: () => getCompanies(filters),
        enabled
    });
};

export const useCreateCompany = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCompany,
        onSuccess: () => {
            toast.success('Empresa creada exitosamente');
            queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
        },
    });
};
