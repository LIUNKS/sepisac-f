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
import { FacturacionPage } from '@/features/facturacion/pages/FacturacionPage';
import { AuditLogsPage } from '@/features/audit/pages/AuditLogsPage';
import { UsuariosPage } from '@/features/usuarios/pages/UsuariosPage';
import { EmpresasPage } from '@/features/empresas/pages/EmpresasPage';
import { ReportesPage } from '@/features/reportes/pages/ReportesPage';

import { useAuthStore } from '@/app/store/useAuthStore';

const SmartRedirector = () => {
    const hasRole = useAuthStore(state => state.hasRole);
    if (hasRole(['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA'])) return <Navigate to="/dashboard" replace />;
    if (hasRole(['ALMACEN'])) return <Navigate to="/inventario" replace />;
    if (hasRole(['TECNICO', 'INGENIERO', 'CONTADOR'])) return <Navigate to="/proyectos" replace />;
    return <Navigate to="/login" replace />;
};

const NotFoundPage = () => (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Página no encontrada</h2>
        <p className="text-muted-foreground mb-8">El módulo que buscas no existe o ha sido movido.</p>
        <Navigate to="/" replace />
    </div>
);

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
                    <Route element={<RoleGuard allowedRoles={['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA']} />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/cotizaciones" element={<CotizacionesPage />} />
                        <Route path="/empleados" element={<EmpleadosPage />} />
                        <Route path="/usuarios" element={<UsuariosPage />} />
                        <Route path="/reportes" element={<ReportesPage />} />
                    </Route>
                    
                    <Route element={<RoleGuard allowedRoles={['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA', 'ALMACEN', 'TECNICO', 'INGENIERO', 'CONTADOR']} />}>
                        <Route path="/proyectos" element={<ProjectsPage />} />
                    </Route>
                    
                    <Route element={<RoleGuard allowedRoles={['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA', 'ALMACEN']} />}>
                        <Route path="/inventario" element={<InventarioPage />} />
                        <Route path="/compras" element={<ComprasPage />} />
                    </Route>
                    
                    <Route element={<RoleGuard allowedRoles={['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA', 'ALMACEN', 'INGENIERO', 'TECNICO']} />}>
                        <Route path="/maquinaria" element={<MaquinariaPage />} />
                    </Route>
                    
                    <Route element={<RoleGuard allowedRoles={['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA', 'CONTADOR']} />}>
                        <Route path="/facturacion" element={<FacturacionPage />} />
                    </Route>
                    
                    <Route element={<RoleGuard allowedRoles={['SUPERADMIN']} />}>
                        <Route path="/empresas" element={<EmpresasPage />} />
                        <Route path="/auditoria" element={<AuditLogsPage />} />
                    </Route>

                    {/* Rutas Protegidas por Roles Específicos */}
                    <Route element={<RoleGuard allowedRoles={['ROLE_ADMIN', 'SUPERADMIN']} />}>
                        <Route path="/admin" element={<div className="p-4">Panel Administrador</div>} />
                    </Route>

                                    </Route>
            </Route>

            {/* Redirección por Defecto Inteligente */}
            <Route path="/" element={<SmartRedirector />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};





