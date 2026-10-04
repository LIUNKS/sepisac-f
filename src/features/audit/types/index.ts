export interface AuditLogUserDTO {
    id: string;
    username: string;
    email: string;
    fullName: string;
}

export interface AuditLogResponseDTO {
    id: string;
    user: AuditLogUserDTO;
    action: string;
    moduleAffected: string;
    entityId: string;
    description: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    createdAt: string;
}

export interface AuditLogFilterDTO {
    companyId?: string;
    module?: string;
    userId?: string;
    action?: string;
    entityId?: string;
    from?: string;
    to?: string;
    page: number;
    size: number;
    sort?: string;
}

export interface PageResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}
