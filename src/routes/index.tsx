import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleGuard } from './guards/RoleGuard';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Rutas Públicas de Auth */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Rutas Protegidas por Autenticación */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />

                    {/* Rutas Protegidas por Roles Específicos */}
                    <Route element={<RoleGuard allowedRoles={['ROLE_ADMIN']} />}>
                        <Route path="/admin" element={<div className="p-4">Panel Administrador</div>} />
                    </Route>

                    {/* Página No Autorizada */}
                    <Route path="/unauthorized" element={<div className="p-6 text-red-600 font-bold">403 - No tienes permiso para ver esta sección</div>} />
                </Route>
            </Route>

            {/* Redirección por Defecto */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};
