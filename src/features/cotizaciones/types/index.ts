export interface Quotation {
    id: string;
    companyId: string;
    companyName: string;
    quotationNumber: string;
    clientName: string;
    serviceType: string;
    currency: string;
    exchangeRate: number;
    subtotalCosts: number;
    profitMarginPercentage: number;
    totalAmount: number;
    status: string;
    detailsCount: number;
    laborCount: number;
    createdAt: string;
}

export interface QuotationsResponse {
    content: Quotation[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}
