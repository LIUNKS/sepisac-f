export interface LoginRequestDTO {
    email: string;
    password: string;
}

export interface AuthResponseDTO {
    token: string;
    type: string;
    email: string;
    username: string;
    role: string;
    companyId: string;
}

export interface AuthUser {
    email: string;
    username: string;
    role: string;
    companyId: string;
}