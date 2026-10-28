import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useToggle2FaMutation } from '@/features/auth/hooks/useLoginMutation';
import { useMeQuery } from '@/features/auth/hooks/useMeQuery';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, Menu, ChevronsUpDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
    LayoutGrid, 
    Briefcase, 
    FileText, 
    Package, 
    Users, 
    BarChart, 
    LogOut,
    HardHat,
    Truck,
    ShoppingCart,
    Receipt,
    Building2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';

const NAVIGATION = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutGrid, roles: ['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA'] },
    { name: 'Proyectos', to: '/proyectos', icon: Briefcase, roles: ['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA', 'ALMACEN', 'TECNICO', 'INGENIERO', 'CONTADOR'] },
    { name: 'Cotizaciones', to: '/cotizaciones', icon: FileText, roles: ['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA'] },
    { name: 'Inventario', to: '/inventario', icon: Package, roles: ['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA', 'ALMACEN'] },
    { name: 'Empleados', to: '/empleados', icon: HardHat, roles: ['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA'] },
    { name: 'Maquinaria', to: '/maquinaria', icon: Truck, roles: ['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA', 'ALMACEN', 'INGENIERO', 'TECNICO'] },
    { name: 'Proveedores', to: '/compras', icon: ShoppingCart, roles: ['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA', 'ALMACEN'] },
    { name: 'Facturación', to: '/facturacion', icon: Receipt, roles: ['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA', 'CONTADOR'] },
    { name: 'Usuarios', to: '/usuarios', icon: Users, roles: ['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA'] },
    { name: 'Empresas', to: '/empresas', icon: Building2, roles: ['SUPERADMIN'] },
    { name: 'Reportes', to: '/reportes', icon: BarChart, roles: ['SUPERADMIN', 'ADMIN_EMPRESA', 'GERENCIA'] },
    { name: 'Auditoría', to: '/auditoria', icon: ShieldCheck, roles: ['SUPERADMIN'] },
];

const getInitials = (name?: string) => {
    if (!name) return 'S';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

export const AppLayout = () => {
    const { user, logout, hasRole } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { mutate: toggle2Fa, isPending: isToggling } = useToggle2FaMutation();
    const location = useLocation();
    
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);
    
    // Call the /me endpoint to keep data fresh (e.g. fullName)
    useMeQuery();

    const getHeaderInfo = () => {
        const path = location.pathname;
        if (path.startsWith('/dashboard')) {
            return { 
                title: 'Panel de Control Ejecutivo', 
                subtitle: 'Indicadores clave de rendimiento (KPIs), métricas financieras y estado operacional en tiempo real' 
            };
        }
        if (path.startsWith('/proyectos')) {
            return { 
                title: 'Gestión de Proyectos y Operaciones', 
                subtitle: 'Control integral de órdenes de trabajo, ejecución técnica, cronogramas y asignación de recursos' 
            };
        }
        if (path.startsWith('/cotizaciones')) {
            return { 
                title: 'Gestión Comercial y Cotizaciones', 
                subtitle: 'Elaboración, costeo y seguimiento de propuestas técnicas y presupuestos comerciales' 
            };
        }
        if (path.startsWith('/inventario')) {
            return { 
                title: 'Control de Almacén e Inventario', 
                subtitle: 'Gestión de existencias, suministros, materiales industriales y alertas de reposición' 
            };
        }
        if (path.startsWith('/empleados')) {
            return { 
                title: 'Personal Operativo y Talento Humano', 
                subtitle: 'Administración de plantilla técnica, contratos, costos por hora y disponibilidad en campo' 
            };
        }
        if (path.startsWith('/maquinaria')) {
            return { 
                title: 'Flota de Maquinaria y Equipos', 
                subtitle: 'Monitoreo de disponibilidad operativa, mantenimientos preventivos y asignación de flota pesada' 
            };
        }
        if (path.startsWith('/compras')) {
            return { 
                title: 'Compras y Gestión de Proveedores', 
                subtitle: 'Emisión de órdenes de compra, catálogo de proveedores y recepción de suministros' 
            };
        }
        if (path.startsWith('/facturacion')) {
            return { 
                title: 'Facturación y Finanzas', 
                subtitle: 'Control de comprobantes de pago, cuentas por cobrar, amortizaciones y conciliación de cobranzas' 
            };
        }
        if (path.startsWith('/usuarios')) {
            return { 
                title: 'Seguridad y Control de Accesos', 
                subtitle: 'Administración centralizada de cuentas de usuario, roles y políticas de seguridad' 
            };
        }
        if (path.startsWith('/empresas')) {
            return { 
                title: 'Gestión Multi-Empresa', 
                subtitle: 'Configuración corporativa de razones sociales, sedes operativas y tenants' 
            };
        }
        if (path.startsWith('/auditoria')) {
            return { 
                title: 'Pistas de Auditoría y Trazabilidad', 
                subtitle: 'Registro cronológico inmutable de actividades, modificaciones y accesos al sistema' 
            };
        }
        if (path.startsWith('/reportes')) {
            return { 
                title: 'Centro de Reportes y Analíticas', 
                subtitle: 'Generación, consolidación y exportación de reportes ejecutivos y balances de gestión' 
            };
        }
        return { 
            title: 'SEPI S.A.C.', 
            subtitle: 'Sistema Integrado de Gestión Empresarial y Operaciones Industriales' 
        };
    };

    const headerInfo = getHeaderInfo();
    const displayName = user?.fullName || user?.username;

    const sidebarContent = (
        <div className="flex flex-col h-full bg-card">
            <div className="px-6 pb-8 pt-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg shadow-xs">
                    S
                </div>
                <span className="font-extrabold text-xl tracking-tight text-foreground">SEPISAC</span>
            </div>

            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mx-6 mb-2">
                Menú Principal
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {NAVIGATION.filter(item => hasRole(item.roles)).map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile Footer with Modern Dropdown */}
            <div className="p-3 mt-auto border-t border-border">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex w-full items-center gap-3 p-2 rounded-xl hover:bg-secondary/70 transition-colors text-left outline-none border border-transparent hover:border-border/80 group">
                            <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-xs border border-primary/20 shadow-2xs group-hover:bg-primary/20 transition-colors">
                                {getInitials(displayName)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate leading-tight" title={displayName}>
                                    {displayName}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate" title={user?.email}>
                                    {user?.email}
                                </p>
                            </div>
                            <ChevronsUpDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        className="w-60 p-1.5 shadow-lg border-border" 
                        side="top" 
                        align="start" 
                        sideOffset={8}
                    >
                        <DropdownMenuLabel className="font-normal p-2">
                            <div className="flex flex-col space-y-1">
                                <p className="text-xs font-semibold text-foreground leading-none">{displayName}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                                <div className="pt-1.5 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                                        {user?.role?.replace('ROLE_', '').replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => toggle2Fa()} 
                            disabled={isToggling} 
                            className="cursor-pointer text-xs py-2 px-2.5 rounded-md"
                        >
                            {user?.twoFactorEnabled ? (
                                <>
                                    <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                                    <span className="font-medium">2FA: Protegido</span>
                                    <span className="ml-auto text-[10px] text-muted-foreground hover:text-foreground">Desactivar</span>
                                </>
                            ) : (
                                <>
                                    <ShieldAlert className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" />
                                    <span className="font-medium">2FA: Desactivado</span>
                                    <span className="ml-auto text-[10px] text-primary font-semibold">Activar</span>
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={logout} 
                            className="cursor-pointer text-xs py-2 px-2.5 rounded-md text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            <span className="font-medium">Cerrar Sesión</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-secondary/30 text-foreground font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="hidden md:flex w-[260px] border-r border-border flex-col shrink-0">
                {sidebarContent}
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-[72px] bg-background/50 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-4 md:px-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-[260px] border-r-0">
                                {sidebarContent}
                            </SheetContent>
                        </Sheet>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-foreground">{headerInfo.title}</h1>
                            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">{headerInfo.subtitle}</p>
                        </div>
                    </div>

                    {/* Clean Topbar Right Section */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* 2FA Security Status Indicator */}
                        <div className="hidden lg:flex items-center">
                            {user?.twoFactorEnabled ? (
                                <div 
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20" 
                                    title="Verificación en dos pasos activa en tu cuenta"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>2FA Protegido</span>
                                </div>
                            ) : (
                                <div 
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20" 
                                    title="Recomendación: Activa 2FA desde tu perfil en la barra lateral"
                                >
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    <span>2FA Inactivo</span>
                                </div>
                            )}
                        </div>

                        {/* User Role Badge */}
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs font-medium text-muted-foreground border border-border">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                            <span className="font-semibold uppercase text-[10px] tracking-wider text-foreground">
                                {user?.role?.replace('ROLE_', '').replace(/_/g, ' ')}
                            </span>
                        </div>

                        {/* Theme Toggle (Dark/Light mode) */}
                        <ThemeToggle />
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-4 md:p-10 md:pt-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
