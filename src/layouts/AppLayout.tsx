import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useToggle2FaMutation } from '@/features/auth/hooks/useLoginMutation';
import { useMeQuery } from '@/features/auth/hooks/useMeQuery';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { 
    LayoutGrid, 
    Briefcase, 
    FileText, 
    Package, 
    Users, 
    BarChart, 
    Bell,
    Search,
    LogOut,
    HardHat,
    Truck,
    ShoppingCart,
    Receipt,
    Building2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';

const NAVIGATION = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutGrid },
    { name: 'Proyectos', to: '/proyectos', icon: Briefcase },
    { name: 'Cotizaciones', to: '/cotizaciones', icon: FileText },
    { name: 'Inventario', to: '/inventario', icon: Package },
    { name: 'Empleados', to: '/empleados', icon: HardHat },
    { name: 'Maquinaria', to: '/maquinaria', icon: Truck },
    { name: 'Proveedores', to: '/compras', icon: ShoppingCart },
    { name: 'Facturación', to: '/facturacion', icon: Receipt },
    { name: 'Usuarios', to: '/usuarios', icon: Users },
    { name: 'Empresas', to: '/empresas', icon: Building2 },
    { name: 'Reportes', to: '/reportes', icon: BarChart },
    { name: 'Auditoría', to: '/auditoria', icon: ShieldCheck },
];

export const AppLayout = () => {
    const { user, logout } = useAuthStore();
    const { mutate: toggle2Fa, isPending: isToggling } = useToggle2FaMutation();
    const location = useLocation();
    
    // Call the /me endpoint to keep data fresh (e.g. fullName)
    useMeQuery();

    const getHeaderInfo = () => {
        switch(location.pathname) {
            case '/dashboard': 
                return { title: 'Panel Principal', subtitle: `Bienvenido, ${user?.fullName || user?.username}` };
            case '/proyectos': 
                return { title: 'Gestión de Proyectos', subtitle: 'Visualiza y administra todas las órdenes de trabajo' };
            case '/cotizaciones': 
                return { title: 'Cotizaciones', subtitle: 'Gestiona presupuestos y propuestas comerciales' };
            case '/inventario': 
                return { title: 'Inventario', subtitle: 'Control de materiales y equipos' };
            case '/empleados': 
                return { title: 'Recursos Humanos', subtitle: 'Gestión de técnicos, ingenieros y personal' };
            case '/maquinaria': 
                return { title: 'Maquinaria y Equipos', subtitle: 'Administración de la flota y herramientas' };
            case '/compras': 
                return { title: 'Compras y Proveedores', subtitle: 'Órdenes de compra y gestión de abastecimiento' };
            case '/facturacion': 
                return { title: 'Facturación', subtitle: 'Control de facturas y cobranzas' };
            case '/usuarios': 
                return { title: 'Usuarios del Sistema', subtitle: 'Administración de accesos y roles' };
            case '/empresas': 
                return { title: 'Empresas', subtitle: 'Configuración y registro de clientes o tenants' };
            case '/auditoria': 
                return { title: 'Logs de Auditoría', subtitle: 'Trazabilidad y registro de eventos del sistema' };
            case '/reportes': 
                return { title: 'Reportes y Analíticas', subtitle: 'Estadísticas e indicadores del negocio' };
            default: 
                return { title: 'SEPISAC', subtitle: 'Sistema ERP' };
        }
    };

    const headerInfo = getHeaderInfo();
    const displayName = user?.fullName || user?.username;

    return (
        <div className="flex h-screen bg-secondary/30 text-foreground font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[260px] bg-card border-r border-border flex flex-col shrink-0">
                <div className="px-6 pb-8 pt-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
                        S
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-foreground">SEPISAC</span>
                </div>

                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mx-6 mb-2">
                    Menú Principal
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {NAVIGATION.map((item) => (
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

                {/* User Profile Footer */}
                <div className="p-4 mt-auto border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${displayName}&background=cbd5e1&color=334155`} 
                                alt="avatar" 
                            />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[13px] font-semibold text-foreground leading-tight truncate" title={displayName}>
                                {displayName}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate" title={user?.email}>
                                {user?.email}
                            </span>
                            <span className="text-[10px] text-primary/80 font-medium capitalize mt-0.5">
                                {user?.role?.replace('ROLE_', '').toLowerCase()}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => toggle2Fa()} 
                        disabled={isToggling}
                        className={`transition-colors shrink-0 ml-2 ${user?.twoFactorEnabled ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-400 hover:text-amber-500'}`}
                        title={user?.twoFactorEnabled ? 'Desactivar 2FA' : 'Activar 2FA'}
                    >
                        {user?.twoFactorEnabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                    </button>
                    <button 
                        onClick={logout} 
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-2"
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-[72px] bg-background/50 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-10 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{headerInfo.title}</h1>
                        <p className="text-sm text-muted-foreground">{headerInfo.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative w-64 hidden md:block">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input 
                                placeholder="Buscar..." 
                                className="pl-9 bg-card border-border h-9 rounded-md focus-visible:ring-primary"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <div className="relative cursor-pointer p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary/50">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
                            </div>
                        </div>

                        <Button className="font-medium shadow-sm">
                            + Nuevo Proyecto
                        </Button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-10 pt-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
