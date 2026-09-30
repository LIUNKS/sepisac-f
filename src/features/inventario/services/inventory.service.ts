import { apiClient } from '@/lib/axios';
import type { InventoryPageResponse, InventoryItem } from '../types';

export const getInventory = async (companyId: string, page = 0, size = 100): Promise<InventoryPageResponse> => {
    // The backend uses ?companyId=...&page=...&size=...
    const response = await apiClient.get<InventoryPageResponse>('/inventory/items', {
        params: {
            companyId,
            page,
            size
        }
    });

    // Map properties from DB to UI needs
    const content = response.data.content.map((item: InventoryItem) => {
        // Derive category based on name/sku
        let category = 'General';
        const nameLower = item.name.toLowerCase();
        if (nameLower.includes('taladro') || nameLower.includes('esmeril') || nameLower.includes('sierra')) category = 'Herramientas';
        else if (nameLower.includes('casco') || nameLower.includes('guantes') || nameLower.includes('lente') || nameLower.includes('epp')) category = 'EPP';
        else if (nameLower.includes('cable') || nameLower.includes('cinta') || nameLower.includes('tornillo')) category = 'Consumibles';

        // Derive unit based on category
        let unit = 'und';
        if (nameLower.includes('cable') || nameLower.includes('cinta')) unit = 'm';
        else if (nameLower.includes('liquido') || nameLower.includes('aceite')) unit = 'L';

        return {
            ...item,
            category,
            location: item.description || 'Almacén Principal',
            unit
        };
    });

    return {
        ...response.data,
        content
    };
};
