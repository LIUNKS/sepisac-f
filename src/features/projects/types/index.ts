export interface Project {
    id: string;
    companyId: string;
    quotationId: string;
    code: string;
    title: string;
    description: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
    clientName: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectsResponse {
    content: Project[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface LaborRequirementSummary {
    specialtyNeeded: string;
    quantityRequired: number;
    estimatedHours: number;
}

export interface EquipmentRequirementSummary {
    itemDescription: string;
    quantity: number;
}

export interface ProjectResourceRequirements {
    projectId: string;
    quotationId: string | null;
    quotationNumber: string | null;
    budgetedEmployees: number;
    assignedEmployees: number;
    budgetedMachinery: number;
    assignedMachinery: number;
    readyToStart: boolean;
    laborRequirements: LaborRequirementSummary[];
    equipmentRequirements: EquipmentRequirementSummary[];
}
