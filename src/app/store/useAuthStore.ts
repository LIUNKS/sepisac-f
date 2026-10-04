import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthResponseDTO, AuthUser } from '@/features/auth/types/auth.types';

export type { AuthUser };

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    setAuth: (data: AuthResponseDTO) => void;
    logout: () => void;
    updateUser: (data: Partial<AuthUser>) => void;
    hasRole: (allowedRoles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            setAuth: (data: AuthResponseDTO) => {
                const user: AuthUser = {
                    email: data.email,
                    username: data.username,
                    fullName: data.fullName,
                    role: data.role,
                    companyId: data.companyId,
                };
                set({
                    user,
                    isAuthenticated: true,
                });
            },
            logout: () => set({ user: null, isAuthenticated: false }),
            updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
            hasRole: (allowedRoles: string[]) => {
                const user = get().user;
                if (!user || !user.role) return false;
                const normalizedRole = user.role.toUpperCase();
                return allowedRoles.some((role) => {
                    const normalizedAllowed = role.toUpperCase();
                    return (
                        normalizedRole === normalizedAllowed ||
                        normalizedRole.replace(/^ROLE_/, '') === normalizedAllowed ||
                        normalizedRole === `ROLE_${normalizedAllowed}`
                    );
                });
            },
        }),
        {
            name: 'sepisac-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
