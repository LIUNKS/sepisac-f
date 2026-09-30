export interface EmployeeResponseDTO {
    id: string;
    companyId: string;
    companyName: string;
    userId?: string;
    userEmail?: string;
    fullName: string;
    specialty: string;
    contractType: string;
    baseSalary: number;
    currentHourlyCost: number;
    isAvailable: boolean;
    createdAt: string;
}

export interface EmployeeCreateDTO {
    companyId?: string;
    userId?: string;
    fullName: string;
    specialty: string;
    contractType: string;
    baseSalary: number;
    currentHourlyCost: number;
}

export interface EmployeeUpdateDTO {
    userId?: string;
    fullName: string;
    specialty: string;
    contractType: string;
    baseSalary: number;
    currentHourlyCost: number;
}

export interface EmployeeFilterDTO {
    companyId?: string;
    search?: string;
    specialty?: string;
    contractType?: string;
    isAvailable?: boolean;
    page?: number;
    size?: number;
    sort?: string;
}
