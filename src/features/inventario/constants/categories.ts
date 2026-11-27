export type InventoryCategoryCode =
    | 'CONSUMIBLES_SOLDADURA'
    | 'REPUESTOS_MECANICOS'
    | 'LUBRICANTES_FLUIDOS'
    | 'HERRAMIENTAS_EQUIPOS'
    | 'SEGURIDAD_EPP'
    | 'OTROS';

export interface InventoryCategoryOption {
    value: InventoryCategoryCode;
    label: string;
    shortLabel: string;
}

export const INVENTORY_CATEGORIES: InventoryCategoryOption[] = [
    { value: 'CONSUMIBLES_SOLDADURA', label: 'Consumibles y Soldadura', shortLabel: 'Consumibles' },
    { value: 'REPUESTOS_MECANICOS', label: 'Repuestos Mecánicos', shortLabel: 'Repuestos' },
    { value: 'LUBRICANTES_FLUIDOS', label: 'Lubricantes y Fluidos', shortLabel: 'Lubricantes' },
    { value: 'HERRAMIENTAS_EQUIPOS', label: 'Herramientas y Equipos', shortLabel: 'Herramientas' },
    { value: 'SEGURIDAD_EPP', label: 'Seguridad y EPP', shortLabel: 'Seguridad / EPP' },
    { value: 'OTROS', label: 'Otros Materiales / Insumos', shortLabel: 'Otros' },
];

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
    INVENTORY_CATEGORIES.map((category) => [category.value, category.label])
);

export const getInventoryCategoryLabel = (category?: string | null): string => {
    if (!category) return CATEGORY_LABELS.CONSUMIBLES_SOLDADURA;
    return CATEGORY_LABELS[category] || category;
};

export const inferInventoryCategoryCode = (item: {
    name?: string;
    description?: string;
    sku?: string;
}): InventoryCategoryCode => {
    const text = `${item.name || ''} ${item.description || ''} ${item.sku || ''}`.toLowerCase();

    if (
        text.includes('rodamiento') ||
        text.includes('faja') ||
        text.includes('reten') ||
        text.includes('retén') ||
        text.includes('sello') ||
        text.includes('pinon') ||
        text.includes('piñón') ||
        text.includes('engranaje') ||
        text.includes('repuesto')
    ) {
        return 'REPUESTOS_MECANICOS';
    }
    if (
        text.includes('aceite') ||
        text.includes('grasa') ||
        text.includes('lubricante') ||
        text.includes('refrigerante') ||
        text.includes('quimico') ||
        text.includes('químico')
    ) {
        return 'LUBRICANTES_FLUIDOS';
    }
    if (
        text.includes('taladro') ||
        text.includes('esmeril') ||
        text.includes('sierra') ||
        text.includes('llave') ||
        text.includes('herramienta') ||
        text.includes('amoladora') ||
        text.includes('prensa') ||
        text.includes('her-')
    ) {
        return 'HERRAMIENTAS_EQUIPOS';
    }
    if (
        text.includes('casco') ||
        text.includes('guante') ||
        text.includes('lente') ||
        text.includes('epp') ||
        text.includes('careta') ||
        text.includes('bota')
    ) {
        return 'SEGURIDAD_EPP';
    }

    return 'CONSUMIBLES_SOLDADURA';
};
