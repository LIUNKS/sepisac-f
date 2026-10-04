import { apiClient } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import type { AuditLogResponseDTO, AuditLogFilterDTO, PageResponse } from '../types';

export const auditKeys = {
    all: ['audit-logs'] as const,
    lists: () => [...auditKeys.all, 'list'] as const,
    list: (filters: AuditLogFilterDTO) => [...auditKeys.lists(), filters] as const,
    entity: (module: string, entityId: string) => [...auditKeys.all, 'entity', module, entityId] as const,
};

export const getAuditLogs = async (filters: AuditLogFilterDTO): Promise<PageResponse<AuditLogResponseDTO>> => {
    const params = new URLSearchParams();
    if (filters.companyId) params.append('companyId', filters.companyId);
    if (filters.module) params.append('module', filters.module);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.action) params.append('action', filters.action);
    if (filters.entityId) params.append('entityId', filters.entityId);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    
    params.append('page', filters.page.toString());
    params.append('size', filters.size.toString());
    if (filters.sort) params.append('sort', filters.sort);

    const { data } = await apiClient.get<PageResponse<AuditLogResponseDTO>>('/v1/audit-logs', { params });
    return data;
};

export const getEntityAuditLogs = async (module: string, entityId: string): Promise<AuditLogResponseDTO[]> => {
    const { data } = await apiClient.get<AuditLogResponseDTO[]>(`/v1/audit-logs/${module}/${entityId}`);
    return data;
};

// Hooks
export const useAuditLogs = (filters: AuditLogFilterDTO, enabled: boolean = true) => {
    return useQuery({
        queryKey: auditKeys.list(filters),
        queryFn: () => getAuditLogs(filters),
        enabled,
    });
};

export const useEntityAuditLogs = (module: string, entityId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: auditKeys.entity(module, entityId),
        queryFn: () => getEntityAuditLogs(module, entityId),
        enabled,
    });
};




