export interface MachineryResponseDTO {
    id: string;
    companyId: string;
    companyName: string;
    code: string;
    name: string;
    status: string; // DISPONIBLE, EN_USO, EN_MANTENIMIENTO, DE_BAJA
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    createdAt: string;
}

export interface MachineryCreateDTO {
    companyId?: string;
    code: string;
    name: string;
    status: string;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
}

export interface MachineryUpdateDTO {
    code: string;
    name: string;
    status: string;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
}

export interface MachineryFilterDTO {
    companyId?: string;
    search?: string;
    status?: string;
    page?: number;
    size?: number;
    sort?: string;
}
