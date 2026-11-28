export interface ServiceTypeOption {
    value: string;
    label: string;
}

export const SERVICE_TYPE_OPTIONS: ServiceTypeOption[] = [
    { value: 'MANTENIMIENTO_PREVENTIVO', label: 'Mantenimiento Preventivo' },
    { value: 'MANTENIMIENTO_CORRECTIVO', label: 'Mantenimiento Correctivo' },
    { value: 'MANTENIMIENTO_CALDERAS', label: 'Mantenimiento de Calderas' },
    { value: 'FABRICACION_MONTAJE', label: 'Fabricación y Montaje' },
    { value: 'SOLDADURA_ESTRUCTURAL', label: 'Soldadura Estructural' },
    { value: 'TORNEADO_EJES', label: 'Torneado de Ejes' },
    { value: 'MECANIZADO_GENERAL', label: 'Mecanizado General' },
    { value: 'OVERHAUL_REDUCTORES', label: 'Overhaul de Reductores' },
];

const KNOWN_SERVICES: Record<string, string> = {
    ...Object.fromEntries(SERVICE_TYPE_OPTIONS.map((option) => [option.value, option.label])),
    MANTENIMIENTO: 'Mantenimiento General',
};

export const formatServiceType = (service?: string | null): string => {
    if (!service) return '-';

    if (KNOWN_SERVICES[service]) {
        return KNOWN_SERVICES[service];
    }

    if (service.includes('_') && service === service.toUpperCase()) {
        return service
            .toLowerCase()
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    return service;
};

export const formatProjectTitle = (title?: string | null): string => {
    if (!title) return '';

    const trimmed = title.trim();
    const sepIndex = trimmed.indexOf(' - ');
    if (sepIndex > 0) {
        const prefix = trimmed.slice(0, sepIndex);
        const rest = trimmed.slice(sepIndex + 3);
        const isCatalogCode = Boolean(KNOWN_SERVICES[prefix]) || (prefix.includes('_') && prefix === prefix.toUpperCase());
        return isCatalogCode ? `${formatServiceType(prefix)} - ${rest}` : title;
    }

    const isCatalogCode = Boolean(KNOWN_SERVICES[trimmed]) || (trimmed.includes('_') && trimmed === trimmed.toUpperCase());
    return isCatalogCode ? formatServiceType(trimmed) : title;
};
