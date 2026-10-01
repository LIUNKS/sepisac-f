import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleGuard } from './guards/RoleGuard';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { ComprasPage } from '@/features/compras/pages/ComprasPage';
import { ProjectsPage } from '@/features/projects/pages/ProjectsPage';
import { CotizacionesPage } from '@/features/cotizaciones/pages/CotizacionesPage';
import { InventarioPage } from '@/features/inventario/pages/InventarioPage';
import { EmpleadosPage } from '@/features/empleados/pages/EmpleadosPage';
import { MaquinariaPage } from '@/features/maquinaria/pages/MaquinariaPage';
import { UsuariosPage } from '@/features/usuarios/pages/UsuariosPage';
import { EmpresasPage } from '@/features/empresas/pages/EmpresasPage';
import { ReportesPage } from '@/features/reportes/pages/ReportesPage';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Rutas Públicas de Autenticación */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Rutas Protegidas por Autenticación */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/proyectos" element={<ProjectsPage />} />
                    <Route path="/cotizaciones" element={<CotizacionesPage />} />
                    <Route path="/inventario" element={<InventarioPage />} />
                    <Route path="/maquinaria" element={<MaquinariaPage />} />
                    <Route path="/compras" element={<ComprasPage />} />
                    <Route path="/empleados" element={<EmpleadosPage />} />
                    <Route path="/usuarios" element={<UsuariosPage />} />
                    <Route path="/empresas" element={<EmpresasPage />} />
                    <Route path="/reportes" element={<ReportesPage />} />

                    {/* Rutas Protegidas por Roles Específicos */}
                    <Route element={<RoleGuard allowedRoles={['ROLE_ADMIN', 'SUPERADMIN']} />}>
                        <Route path="/admin" element={<div className="p-4">Panel Administrador</div>} />
                    </Route>

                    {/* Página No Autorizada */}
                    <Route
                        path="/unauthorized"
                        element={<div className="p-6 text-red-600 font-bold">403 - No tienes permiso para ver esta sección</div>}
                    />
                </Route>
            </Route>

            {/* Redirección por Defecto: Raíz y Wildcard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

