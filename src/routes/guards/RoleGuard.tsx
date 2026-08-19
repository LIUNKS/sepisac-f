import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/app/store/useAuthStore';

interface RoleGuardProps {
    allowedRoles: string[];
}

export const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
    const hasRole = useAuthStore((state) => state.hasRole);

    if (!hasRole(allowedRoles)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};