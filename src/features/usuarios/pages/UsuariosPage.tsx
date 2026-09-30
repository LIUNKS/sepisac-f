import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users as UsersIcon, UserCheck, ShieldCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UsersTable } from '../components/UsersTable';
import { UserFormModal } from '../components/UserFormModal';
import { useUsers } from '../api';
import type { UserResponseDTO } from '../types';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useDebounce } from '@/hooks/useDebounce';

export const UsuariosPage = () => {
    // Obtenemos el companyId del usuario logueado (asumiendo que está en authStore)
    // Si la estructura del store es distinta, se debe ajustar aquí.
    const user = useAuthStore((state: any) => state.user);
    const companyId = user?.companyId;

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserResponseDTO | null>(null);

    // Fetch data via TanStack Query
    const { data, isLoading } = useUsers(companyId, {
        search: debouncedSearch || undefined,
        page: 0,
        size: 50, // Idealmente agregaríamos un paginador real aquí
    });

    const usersList = data?.content || [];
    const totalUsers = data?.totalElements || 0;
    const activeUsers = usersList.filter(u => u.isActive).length;
    const adminUsers = usersList.filter(u => u.roleName?.toLowerCase().includes('admin')).length;

    const kpisData = [
        { title: 'Total de Usuarios', value: totalUsers.toString(), icon: UsersIcon, color: 'primary' },
        { title: 'Usuarios Activos', value: activeUsers.toString(), icon: UserCheck, color: 'success' },
        { title: 'Administradores', value: adminUsers.toString(), icon: ShieldCheck, color: 'info' },
    ];

    const handleEdit = (user: UserResponseDTO) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpisData.map((kpi, idx) => (
                    <Card key={idx} className="border-border shadow-sm relative overflow-hidden">
                        <CardContent className="p-6">
                            <p className="text-sm font-semibold text-muted-foreground mb-2">{kpi.title}</p>
                            <h3 className="text-3xl font-bold text-foreground mb-2">{kpi.value}</h3>
                            <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center ${
                                kpi.color === 'primary' ? 'bg-secondary text-muted-foreground' : 
                                kpi.color === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                            }`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Card */}
            <Card className="border-border shadow-sm">
                <CardHeader className="p-4 border-b border-border bg-muted/20">
                    <div className="flex justify-between items-center">
                        <Input 
                            placeholder="Buscar por nombre, correo o usuario..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <UsersTable 
                        users={usersList} 
                        isLoading={isLoading} 
                        onEdit={handleEdit} 
                    />
                </CardContent>
            </Card>

            {isModalOpen && (
                <UserFormModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    userToEdit={userToEdit}
                    companyId={companyId}
                />
            )}
        </div>
    );
};
