import { apiClient } from '@/lib/axios';
import type { InventoryPageResponse, InventoryItem } from '../types';

export const getInventory = async (companyId?: string, page = 0, size = 100, search?: string): Promise<InventoryPageResponse> => {
    const params: Record<string, any> = { page, size };
    if (search && search.trim() !== '') {
        params.search = search.trim();
    }
    if (companyId) {
        params.companyId = companyId;
    }

    const response = await apiClient.get<InventoryPageResponse>('inventory/items', {
        params
    });

    // Map properties from DB to UI needs with industrial classification
    const content = response.data.content.map((item: InventoryItem) => {
        const text = (item.name + ' ' + (item.description || '') + ' ' + item.sku).toLowerCase();

        // 1. Derive industrial category
        let category = 'Consumibles y Soldadura';
        if (text.includes('rodamiento') || text.includes('faja') || text.includes('reten') || text.includes('sello') || text.includes('pinon') || text.includes('engranaje')) {
            category = 'Repuestos Mecánicos';
        } else if (text.includes('aceite') || text.includes('grasa') || text.includes('lubricante') || text.includes('refrigerante') || text.includes('quimico')) {
            category = 'Lubricantes y Fluidos';
        } else if (text.includes('taladro') || text.includes('esmeril') || text.includes('sierra') || text.includes('llave') || text.includes('herramienta')) {
            category = 'Herramientas y Equipos';
        } else if (text.includes('casco') || text.includes('guante') || text.includes('lente') || text.includes('epp') || text.includes('careta') || text.includes('bota')) {
            category = 'Seguridad y EPP';
        } else if (text.includes('electrodo') || text.includes('soldadura') || text.includes('disco') || text.includes('perno') || text.includes('gas') || text.includes('argon') || text.includes('alambre')) {
            category = 'Consumibles y Soldadura';
        }

        // 2. Derive unit
        let unit = 'und';
        if (text.includes('caja')) unit = 'cajas';
        else if (text.includes('cilindro') || text.includes('gal')) unit = 'cil';
        else if (text.includes('balde')) unit = 'baldes';
        else if (text.includes('balon') || text.includes('balón') || text.includes('m3')) unit = 'balones';
        else if (text.includes('ciento') || text.includes('cto')) unit = 'ctos';
        else if (text.includes('kg')) unit = 'kg';
        else if (text.includes('metro') || text.includes(' m')) unit = 'm';
        else if (text.includes('litro') || text.includes(' l')) unit = 'L';

        // 3. Derive realistic warehouse location
        let location = 'Almacén Central - Nave A';
        if (category === 'Repuestos Mecánicos') {
            location = 'Nave B - Estante B2';
        } else if (category === 'Lubricantes y Fluidos') {
            location = 'Bahía de Lubricantes (Zona L)';
        } else if (text.includes('gas') || text.includes('argon')) {
            location = 'Patio de Gases Técnicos';
        } else if (text.includes('electrodo') || text.includes('disco')) {
            location = 'Nave A - Anaquel Soldadura';
        } else if (text.includes('perno')) {
            location = 'Nave A - Módulo Pernos';
        } else if (category === 'Herramientas y Equipos') {
            location = 'Pañol de Herramientas';
        } else if (category === 'Seguridad y EPP') {
            location = 'Módulo Seguridad y EPP';
        }

        return {
            ...item,
            category,
            location,
            unit
        };
    });

    return {
        ...response.data,
        content
    };
};

export interface UpdateInventoryItemPayload {
    sku: string;
    name: string;
    description: string;
    purchaseCost: number;
    salePrice: number;
    minStockAlert: number;
}

export const updateInventoryItem = async (id: string, payload: UpdateInventoryItemPayload): Promise<InventoryItem> => {
    const response = await apiClient.put<InventoryItem>(`inventory/items/${id}`, payload);
    return response.data;
};
