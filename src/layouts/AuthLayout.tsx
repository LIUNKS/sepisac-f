import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store/useAuthStore';

export const AuthLayout = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-md">
                <Outlet />
            </div>
        </div>
    );
};