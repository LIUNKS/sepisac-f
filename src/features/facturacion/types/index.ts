export interface InvoiceResponseDTO {
    id: string;
    companyId: string;
    companyName: string;
    quotationId: string;
    quotationNumber: string;
    projectId?: string;
    projectCode?: string;
    clientName: string;
    invoiceNumber: string;
    currency: string;
    totalAmount: number;
    totalPaid: number;
    balanceDue: number;
    paymentStatus: 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'VENCIDA' | 'ANULADA';
    issueDate: string;
    dueDate: string;
    createdAt: string;
}

export interface InvoicePaymentCreateDTO {
    amountPaid: number;
    paymentMethod: 'TRANSFERENCIA' | 'EFECTIVO' | 'DEPOSITO' | 'TARJETA' | 'CHEQUE';
    referenceCode?: string;
    currency?: string;
    exchangeRate?: number;
    paymentDate?: string;
}

export interface InvoicePaymentResponseDTO {
    id: string;
    invoiceId: string;
    amountPaid: number;
    paymentMethod: string;
    referenceCode?: string;
    currency?: string;
    exchangeRate?: number;
    paymentDate: string;
    createdAt: string;
}
