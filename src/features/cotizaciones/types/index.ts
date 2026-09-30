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
    details?: QuotationDetail[];
    laborRequirements?: QuotationLabor[];
}

export interface QuotationsResponse {
    content: Quotation[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface QuotationDetail {
    id: string;
    itemDescription: string;
    itemType: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface QuotationLabor {
    id: string;
    specialtyNeeded: string;
    quantityRequired: number;
    estimatedHours: number;
    lockedHourlyCost: number;
    subtotal: number;
}
