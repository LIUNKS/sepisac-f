import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users as UsersIcon, UserCheck, ShieldCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UsersTable } from '../components/UsersTable';
import { UserFormModal } from '../components/UserFormModal';
import { RolesTab } from '../components/RolesTab';
import { useUsers } from '../api';
import type { UserResponseDTO } from '../types';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useDebounce } from '@/hooks/useDebounce';

export const UsuariosPage = () => {
    const user = useAuthStore((state: any) => state.user);
    const companyId = user?.companyId;

    const [activeTab, setActiveTab] = useState('Usuarios');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserResponseDTO | null>(null);

    const { data, isLoading } = useUsers(companyId, {
        search: debouncedSearch || undefined,
        page: 0,
        size: 50, 
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & KPI Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground mt-1">
                        Administra los accesos, cuentas y roles del sistema.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpisData.map((kpi, idx) => (
                    <Card key={idx} className="border-border/50 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">{kpi.title}</h3>
                            <div className={`p-2 bg-${kpi.color}/10 rounded-full`}>
                                <kpi.icon className={`h-4 w-4 text-${kpi.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpi.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
                <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-6">
                    <div className="flex gap-4 border-b w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('Usuarios')}
                            className={`pb-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                                activeTab === 'Usuarios' 
                                    ? 'border-primary text-primary' 
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Usuarios
                        </button>
                        <button
                            onClick={() => setActiveTab('Roles')}
                            className={`pb-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                                activeTab === 'Roles' 
                                    ? 'border-primary text-primary' 
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Roles
                        </button>
                    </div>

                    {activeTab === 'Usuarios' && (
                        <Button onClick={handleCreate} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Registrar Usuario
                        </Button>
                    )}
                </div>

                {activeTab === 'Usuarios' ? (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <div className="relative w-full max-w-sm">
                                <Input 
                                    placeholder="Buscar usuario..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-4 pr-10"
                                />
                            </div>
                        </div>

                        <UsersTable 
                            users={usersList} 
                            isLoading={isLoading} 
                            onEdit={handleEdit}
                        />
                    </>
                ) : (
                    <RolesTab />
                )}
            </div>

            <UserFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userToEdit={userToEdit}
            />
        </div>
    );
};
