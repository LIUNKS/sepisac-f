export interface Supplier {
    id: string;
    companyId: string;
    businessName: string;
    ruc: string;
    contactPhone?: string;
    email?: string;
    createdAt?: string;
    isDeleted?: boolean;
}

export interface SupplierCreateDTO {
    companyId?: string;
    businessName: string;
    ruc: string;
    contactPhone?: string;
    email?: string;
}

export interface SupplierFilterDTO {
    companyId?: string;
    page: number;
    size: number;
    search?: string;
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
