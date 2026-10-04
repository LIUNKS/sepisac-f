export interface LoginRequestDTO {
    email: string;
    password: string;
}

export interface AuthResponseDTO {
    email: string;
    username: string;
    fullName: string;
    role: string;
    companyId: string;
    twoFactorRequired?: boolean;
    twoFactorEnabled?: boolean;
}

export interface AuthUser {
    email: string;
    username: string;
    fullName: string;
    role: string;
    companyId: string;
    twoFactorRequired?: boolean;
    twoFactorEnabled?: boolean;
}
