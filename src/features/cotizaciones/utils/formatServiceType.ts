export const formatServiceType = (service?: string | null): string => {
    if (!service) return '-';
    
    const knownServices: Record<string, string> = {
        'TORNEADO_EJES': 'Torneado de Ejes',
        'OVERHAUL_REDUCTORES': 'Overhaul de Reductores',
        'FABRICACION_MONTAJE': 'Fabricación y Montaje',
        'MANTENIMIENTO': 'Mantenimiento General',
        'MANTENIMIENTO_CALDERAS': 'Mantenimiento de Calderas',
        'MANTENIMIENTO_PREVENTIVO': 'Mantenimiento Preventivo',
        'MANTENIMIENTO_CORRECTIVO': 'Mantenimiento Correctivo',
        'SOLDADURA_ESTRUCTURAL': 'Soldadura Estructural',
        'MECANIZADO_GENERAL': 'Mecanizado General',
    };

    if (knownServices[service]) {
        return knownServices[service];
    }

    if (service.includes('_') && service === service.toUpperCase()) {
        return service
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    return service;
};
