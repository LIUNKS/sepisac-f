export interface InventoryItem {
    id: string;
    companyId: string;
    companyName: string;
    sku: string; // we'll map this to 'code' in the UI
    name: string;
    description: string; // we'll use this for 'location' 
    stockQuantity: number;
    purchaseCost: number;
    salePrice: number;
    minStockAlert: number;
    isLowStock: boolean;
    createdAt: string;

    // Frontend-only properties that we map locally
    category?: string;
    location?: string;
    unit?: string;
}

export interface InventoryPageResponse {
    content: InventoryItem[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}
export * from './purchase-order';
