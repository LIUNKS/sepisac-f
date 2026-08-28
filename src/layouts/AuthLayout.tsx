import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store/useAuthStore';

export const AuthLayout = () => {
    const { isAuthenticated, token } = useAuthStore();

    if (isAuthenticated && token) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 p-4">
            <div className="w-full max-w-md">
                <Outlet />
            </div>
        </div>
    );
};