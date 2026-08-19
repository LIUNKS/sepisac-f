import { useAuthStore } from '@/app/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const DashboardPage = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Panel Principal</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-slate-500">Usuario Conectado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user?.name}</div>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-slate-500">Roles Asignados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user?.roles.join(', ')}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-slate-500">Estado del Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">Operativo</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};