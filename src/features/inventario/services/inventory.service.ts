import { apiClient } from '@/lib/axios';
import type { InventoryPageResponse, InventoryItem } from '../types';
import {
    INVENTORY_CATEGORIES,
    getInventoryCategoryLabel,
    inferInventoryCategoryCode,
    type InventoryCategoryCode,
} from '../constants/categories';

const VALID_CATEGORY_SET = new Set<string>(INVENTORY_CATEGORIES.map((c) => c.value));

export const getInventory = async (
    companyId?: string,
    page = 0,
    size = 100,
    search?: string,
    category?: string
): Promise<InventoryPageResponse> => {
    const params: Record<string, any> = { page, size };
    if (search && search.trim() !== '') {
        params.search = search.trim();
    }
    if (companyId) {
        params.companyId = companyId;
    }
    if (category && category.trim() !== '') {
        params.category = category.trim();
    }

    const response = await apiClient.get<InventoryPageResponse>('inventory/items', {
        params,
    });

    const content = response.data.content.map((item: InventoryItem) => {
        const text = `${item.name} ${item.description || ''} ${item.sku}`.toLowerCase();

        const rawCategory = item.category as string | undefined;
        const categoryCode: InventoryCategoryCode =
            rawCategory && VALID_CATEGORY_SET.has(rawCategory)
                ? (rawCategory as InventoryCategoryCode)
                : inferInventoryCategoryCode(item);
        const categoryLabel = getInventoryCategoryLabel(categoryCode);

        let unit = 'und';
        if (text.includes('caja')) unit = 'cajas';
        else if (text.includes('cilindro') || text.includes('gal')) unit = 'cil';
        else if (text.includes('balde')) unit = 'baldes';
        else if (text.includes('balon') || text.includes('balón') || text.includes('m3')) unit = 'balones';
        else if (text.includes('ciento') || text.includes('cto')) unit = 'ctos';
        else if (text.includes('kg')) unit = 'kg';
        else if (text.includes('metro') || text.includes(' m')) unit = 'm';
        else if (text.includes('litro') || text.includes(' l')) unit = 'L';

        let location = 'Almacén Central - Nave A';
        if (categoryCode === 'REPUESTOS_MECANICOS') {
            location = 'Nave B - Estante B2';
        } else if (categoryCode === 'LUBRICANTES_FLUIDOS') {
            location = 'Bahía de Lubricantes (Zona L)';
        } else if (text.includes('gas') || text.includes('argon')) {
            location = 'Patio de Gases Técnicos';
        } else if (text.includes('electrodo') || text.includes('disco')) {
            location = 'Nave A - Anaquel Soldadura';
        } else if (text.includes('perno')) {
            location = 'Nave A - Módulo Pernos';
        } else if (categoryCode === 'HERRAMIENTAS_EQUIPOS') {
            location = 'Pañol de Herramientas';
        } else if (categoryCode === 'SEGURIDAD_EPP') {
            location = 'Módulo Seguridad y EPP';
        }

        return {
            ...item,
            category: categoryCode,
            categoryLabel,
            location,
            unit,
        };
    });

    return {
        ...response.data,
        content,
    };
};

export interface UpdateInventoryItemPayload {
    sku: string;
    name: string;
    description: string;
    category?: InventoryCategoryCode;
    purchaseCost: number;
    salePrice: number;
    minStockAlert: number;
}

export const updateInventoryItem = async (id: string, payload: UpdateInventoryItemPayload): Promise<InventoryItem> => {
    const response = await apiClient.put<InventoryItem>(`inventory/items/${id}`, payload);
    return response.data;
};

export interface CreateInventoryItemPayload {
    companyId?: string;
    sku: string;
    name: string;
    description?: string;
    category?: InventoryCategoryCode;
    stockQuantity: number;
    purchaseCost?: number;
    salePrice?: number;
    minStockAlert?: number;
}

export const createInventoryItem = async (payload: CreateInventoryItemPayload): Promise<InventoryItem> => {
    const response = await apiClient.post<InventoryItem>('inventory/items', payload);
    return response.data;
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
    await apiClient.delete(`inventory/items/${id}`);
};
