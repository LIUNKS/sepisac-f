import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/app/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';

export const AppLayout = () => {
    const { user, logout } = useAuthStore();

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="font-extrabold text-xl text-slate-900 tracking-tight">SEPISAC</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-mono">v1.0</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                        <UserIcon className="h-4 w-4 text-slate-500" />
                        <span className="font-medium">{user?.username}</span>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono">
                            {user?.role}
                        </span>
                    </div>

                    <Button variant="ghost" size="sm" onClick={logout} className="text-slate-600 hover:text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Salir
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
                <Outlet />
            </main>
        </div>
    );
};