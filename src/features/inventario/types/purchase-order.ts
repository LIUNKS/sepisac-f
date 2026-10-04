export interface PurchaseOrderDetail {
    id: string;
    inventoryItemId: string;
    itemSku: string;
    itemName: string;
    quantity: number;
    unitCost: number;
    subtotal: number;
}

export interface PurchaseOrder {
    id: string;
    companyId: string;
    supplierId: string;
    supplierName: string;
    supplierRuc: string;
    orderNumber: string;
    currency: string;
    exchangeRate: number;
    status: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    details: PurchaseOrderDetail[];
}

export interface CreatePurchaseOrderDetail {
    inventoryItemId: string;
    quantity: number;
    unitCost: number;
}

export interface CreatePurchaseOrder {
    companyId?: string; // Solo usado por SUPERADMIN opcionalmente si es por URL parameter, pero el backend pide param companyId
    supplierId: string;
    currency: string;
    exchangeRate: number;
    details: CreatePurchaseOrderDetail[];
}

export interface AutoGenerateOrdersResponse {
    companyId: string;
    generatedOrdersCount: number;
    totalAmountPen: number;
    orders: PurchaseOrder[];
}
