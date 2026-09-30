import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/app/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { 
    LayoutGrid, 
    Briefcase, 
    FileText, 
    Package, 
    Users, 
    BarChart, 
    Bell,
    Search,
    LogOut
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';

const NAVIGATION = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutGrid },
    { name: 'Proyectos', to: '/proyectos', icon: Briefcase },
    { name: 'Cotizaciones', to: '/cotizaciones', icon: FileText },
    { name: 'Inventario', to: '/inventario', icon: Package },
    { name: 'Usuarios', to: '/usuarios', icon: Users },
    { name: 'Reportes', to: '/reportes', icon: BarChart },
];

export const AppLayout = () => {
    const { user, logout } = useAuthStore();

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

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${user?.username}&background=cbd5e1&color=334155`} 
                                alt="avatar" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-foreground leading-tight">
                                {user?.username}
                            </span>
                            <span className="text-[11px] text-muted-foreground capitalize">
                                {user?.role?.replace('ROLE_', '').toLowerCase()}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={logout} 
                        className="text-muted-foreground hover:text-destructive transition-colors"
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
                        <h1 className="text-2xl font-bold text-foreground">Panel Principal</h1>
                        <p className="text-sm text-muted-foreground">Bienvenido, {user?.username}</p>
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