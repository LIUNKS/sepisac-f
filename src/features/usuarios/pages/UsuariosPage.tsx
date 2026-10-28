import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    Users as UsersIcon,
    UserCheck,
    ShieldCheck,
    Plus,
    Search,
    DownloadCloud,
    Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UsersTable } from '../components/UsersTable';
import { UserFormModal } from '../components/UserFormModal';
import { RoleFormModal } from '../components/RoleFormModal';
import { RolesTab } from '../components/RolesTab';
import { useUsers } from '../api';
import { useRoles } from '../api/roles';
import type { UserResponseDTO } from '../types';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCompanies } from '@/features/empresas/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportUsersToExcel } from '../utils/exportUsersToExcel';

export const UsuariosPage = () => {
    const { user, hasRole } = useAuthStore();
    const isSuperAdmin = hasRole(['SUPERADMIN']);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'all' | 'activos' | 'inactivos' | 'roles'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserResponseDTO | null>(null);

    const { data: companiesPage } = useCompanies({ page: 0, size: 100 }, isSuperAdmin);
    const { data: rolesData } = useRoles();
    const rolesList = rolesData || [];

    const effectiveCompanyId = isSuperAdmin
        ? (selectedCompanyId !== 'all' ? selectedCompanyId : undefined)
        : user?.companyId;

    const { data, isLoading } = useUsers(effectiveCompanyId, {
        page: 0,
        size: 1000,
        search: '',
    });

    const allUsers = data?.content || [];

    // Metrics
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.isActive).length;
    const inactiveUsers = allUsers.filter(u => !u.isActive).length;
    const adminUsers = allUsers.filter(u => u.roleName?.toLowerCase().includes('admin')).length;

    const kpisData = [
        {
            title: 'Total de Usuarios',
            value: totalUsers,
            subtitle: 'Cuentas registradas',
            icon: UsersIcon,
            bg: 'bg-secondary text-muted-foreground'
        },
        {
            title: 'Usuarios Activos',
            value: activeUsers,
            subtitle: 'Con acceso vigente al sistema',
            icon: UserCheck,
            bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
        },
        {
            title: 'Administradores',
            value: adminUsers,
            subtitle: 'Gestores y Superadmins',
            icon: ShieldCheck,
            bg: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
        },
        {
            title: 'Roles de Sistema',
            value: rolesList.length,
            subtitle: 'Perfiles de autorización',
            icon: Building2,
            bg: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
        },
    ];

    const tabs = [
        { id: 'all' as const, label: 'Todos', count: totalUsers },
        { id: 'activos' as const, label: 'Activos', count: activeUsers },
        { id: 'inactivos' as const, label: 'Inactivos', count: inactiveUsers },
        { id: 'roles' as const, label: 'Roles', count: rolesList.length },
    ];

    // Filter users
    const filteredUsers = useMemo(() => {
        let list = allUsers;

        if (activeTab === 'activos') {
            list = list.filter(u => u.isActive);
        } else if (activeTab === 'inactivos') {
            list = list.filter(u => !u.isActive);
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            list = list.filter(u =>
                u.fullName?.toLowerCase().includes(term) ||
                u.email?.toLowerCase().includes(term) ||
                u.username?.toLowerCase().includes(term) ||
                u.roleName?.toLowerCase().includes(term) ||
                u.companyName?.toLowerCase().includes(term)
            );
        }

        return list;
    }, [allUsers, activeTab, searchTerm]);

    // Paginated slice
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const paginatedUsers = useMemo(() => {
        const start = page * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, page, pageSize]);

    const handleEdit = (userItem: UserResponseDTO) => {
        setUserToEdit(userItem);
        setIsUserModalOpen(true);
    };

    const handleCreate = () => {
        setUserToEdit(null);
        setIsUserModalOpen(true);
    };

    return (
        <div className="space-y-6">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpisData.map((kpi, idx) => (
                    <Card key={idx} className="border-border shadow-sm relative overflow-hidden">
                        <CardContent className="p-6">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                                {kpi.title}
                            </span>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-3xl font-bold tracking-tight text-foreground">
                                    {isLoading ? '...' : kpi.value}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>{kpi.subtitle}</span>
                            </div>

                            <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Table Card with Unified Single-Row Toolbar */}
            <Card className="border-border shadow-sm">
                <div className="border-b border-border p-0">
                    <div className="flex items-center justify-between px-6 pt-4 gap-4 flex-nowrap">
                        {/* Tabs with Counts */}
                        <div className="flex items-center gap-3 sm:gap-5 shrink-0 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setPage(0);
                                    }}
                                    className={`pb-3.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${activeTab === tab.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-secondary text-muted-foreground'
                                        }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search, Filter, Export and Action Buttons */}
                        <div className="flex items-center gap-2 mb-2.5 shrink-0">
                            {activeTab === 'roles' ? (
                                isSuperAdmin && (
                                    <Button
                                        size="sm"
                                        className="h-8 text-xs font-medium shadow-sm px-3"
                                        onClick={() => setIsRoleModalOpen(true)}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        Nuevo Rol
                                    </Button>
                                )
                            ) : (
                                <>
                                    {isSuperAdmin && (
                                        <Select
                                            value={selectedCompanyId}
                                            onValueChange={(val) => {
                                                setSelectedCompanyId(val);
                                                setPage(0);
                                            }}
                                        >
                                            <SelectTrigger className="h-8 text-xs w-36 sm:w-44 bg-background">
                                                <SelectValue placeholder="Todas las empresas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas las empresas</SelectItem>
                                                {companiesPage?.content.map((company) => (
                                                    <SelectItem key={company.id} value={company.id}>
                                                        {company.businessName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    <div className="relative w-44 sm:w-56">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar usuario o correo..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setPage(0);
                                            }}
                                            className="h-8 pl-8 text-xs bg-background"
                                        />
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs font-medium px-2.5"
                                        onClick={() => exportUsersToExcel(filteredUsers)}
                                        disabled={filteredUsers.length === 0}
                                    >
                                        <DownloadCloud className="w-3.5 h-3.5 mr-1 text-primary" />
                                        Exportar
                                    </Button>

                                    <Button
                                        size="sm"
                                        className="h-8 text-xs font-medium shadow-sm px-3"
                                        onClick={handleCreate}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        Nuevo Usuario
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    {activeTab === 'roles' ? (
                        <RolesTab />
                    ) : (
                        <UsersTable
                            users={paginatedUsers}
                            isLoading={isLoading}
                            onEdit={handleEdit}
                        />
                    )}
                </div>
            </Card>

            {/* Pagination Controls for Users */}
            {activeTab !== 'roles' && !isLoading && totalPages > 1 && (
                <div className="flex justify-end items-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Página {page + 1} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                    >
                        Siguiente
                    </Button>
                </div>
            )}

            {/* Modal de edición / creación de usuario */}
            <UserFormModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                userToEdit={userToEdit}
                companyId={effectiveCompanyId}
            />

            {/* Modal de creación de rol */}
            <RoleFormModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
            />
        </div>
    );
};
