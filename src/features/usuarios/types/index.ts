export interface UserResponseDTO {
    id: string;
    companyId: string;
    companyName: string;
    roleId: number;
    roleName: string;
    username: string;
    email: string;
    fullName: string;
    isActive: boolean;
    createdAt: string;
}

export interface UserCreateDTO {
    companyId?: string;
    email: string;
    username?: string;
    fullName: string;
    password?: string;
    roleId: number;
}

export interface UserUpdateDTO {
    fullName: string;
    username?: string;
    roleId: number;
}

export interface UserFilterDTO {
    companyId?: string;
    search?: string;
    isActive?: boolean;
    roleId?: number;
    page?: number;
    size?: number;
    sort?: string;
}

export interface RoleResponseDTO {
    id: number;
    name: string;
    description: string;
}
