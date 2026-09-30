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
