import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
    id: string;
    email: string;
    name: string;
    roles: string[];
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
    hasRole: (allowedRoles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
            logout: () => set({ token: null, user: null, isAuthenticated: false }),
            hasRole: (allowedRoles: string[]) => {
                const user = get().user;
                if (!user || !user.roles) return false;
                return user.roles.some((role) => allowedRoles.includes(role));
            },
        }),
        {
            name: 'sepisac-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);