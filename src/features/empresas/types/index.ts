export interface CompanyResponseDTO {
    id: string;
    businessName: string;
    ruc: string;
    subscriptionStatus: string;
    createdAt: string;
}

export interface CompanyCreateDTO {
    businessName: string;
    ruc: string;
    subscriptionStatus?: string;
}

export interface CompanyFilterDTO {
    search?: string;
    subscriptionStatus?: string;
    page?: number;
    size?: number;
    sort?: string;
}
