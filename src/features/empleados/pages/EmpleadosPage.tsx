import { useState, useEffect } from 'react';
import { Users, Search, Plus, DownloadCloud, UserCheck, CircleDollarSign, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCompanies } from '@/features/empresas/api';
import { useEmployees } from '../api';
import { EmployeesTable, EmployeeFormModal } from '../components';
import type { EmployeeResponseDTO } from '../types';
import { exportEmployeesToExcel } from '../utils/exportEmployeesToExcel';

export const EmpleadosPage = () => {
    const user = useAuthStore((state) => state.user);
    const hasRole = useAuthStore((state) => state.hasRole);
    const isSuperAdmin = hasRole(['SUPERADMIN']);

    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'TODOS' | 'DISPONIBLES' | 'NO_DISPONIBLES' | 'PLANILLA' | 'LOCACION'>('TODOS');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const [page, setPage] = useState(0);
    const size = 50;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<EmployeeResponseDTO | null>(null);

    // List companies for superadmin
    const { data: companiesData } = useCompanies(
        { page: 0, size: 50 },
        isSuperAdmin && !user?.companyId
    );

    useEffect(() => {
        if (user?.companyId) {
            setSelectedCompanyId(user.companyId);
        } else if (companiesData?.content && companiesData.content.length > 0 && !selectedCompanyId) {
            setSelectedCompanyId(companiesData.content[0].id);
        }
    }, [user?.companyId, companiesData]);

    const targetCompanyId = user?.companyId || selectedCompanyId || undefined;

    const { data, isLoading } = useEmployees(targetCompanyId, {
        search: debouncedSearch,
        page,
        size
    });

    const employees = data?.content || [];
    const totalPages = data?.totalPages || 0;

    // Filter by tab
    const filteredEmployees = employees.filter((emp) => {
        if (activeTab === 'TODOS') return true;
        if (activeTab === 'DISPONIBLES') return emp.isAvailable;
        if (activeTab === 'NO_DISPONIBLES') return !emp.isAvailable;
        if (activeTab === 'PLANILLA') return emp.contractType === 'PLANILLA';
        if (activeTab === 'LOCACION') return emp.contractType === 'LOCACION';
        return true;
    });

    // KPI metrics
    const totalCount = employees.length;
    const availableCount = employees.filter(e => e.isAvailable).length;
    const planillaCount = employees.filter(e => e.contractType === 'PLANILLA').length;
    const locacionCount = employees.filter(e => e.contractType === 'LOCACION').length;
    const noAvailableCount = totalCount - availableCount;

    const avgHourlyCost = totalCount > 0
        ? employees.reduce((acc, curr) => acc + curr.currentHourlyCost, 0) / totalCount
        : 0;

    const tabs = [
        { id: 'TODOS' as const, label: 'Todos', count: totalCount },
        { id: 'DISPONIBLES' as const, label: 'Disponibles', count: availableCount },
        { id: 'NO_DISPONIBLES' as const, label: 'Asignados', count: noAvailableCount },
        { id: 'PLANILLA' as const, label: 'Planilla', count: planillaCount },
        { id: 'LOCACION' as const, label: 'Locación', count: locacionCount },
    ];

    const kpisData = [
        {
            title: 'Total de Trabajadores',
            value: totalCount.toString(),
            trend: `${planillaCount} en planilla, ${locacionCount} por locación`,
            trendType: 'success',
            icon: Users
        },
        {
            title: 'Disponibles para Asignar',
            value: availableCount.toString(),
            trend: availableCount > 0 ? 'Listos para proyectos' : 'Personal 100% ocupado',
            trendType: availableCount > 0 ? 'success' : 'warning',
            icon: UserCheck
        },
        {
            title: 'Costo Promedio Hora',
            value: `S/ ${avgHourlyCost.toFixed(2)}`,
            trend: 'Base para cotización de mano de obra',
            trendType: 'success',
            icon: CircleDollarSign
        }
    ];

    const handleEdit = (employee: EmployeeResponseDTO) => {
        setEmployeeToEdit(employee);
        setIsModalOpen(true);
    };

    return (
        <div>
            {/* Header with Title and Superadmin Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {isSuperAdmin && companiesData?.content && companiesData.content.length > 0 && (
                    <div className="flex items-center gap-2 bg-card p-1.5 rounded-lg border border-border shadow-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground ml-2" />
                        <span className="text-xs font-semibold text-muted-foreground">Empresa:</span>
                        <Select
                            value={selectedCompanyId}
                            onValueChange={(val) => {
                                setSelectedCompanyId(val);
                                setPage(0);
                            }}
                        >
                            <SelectTrigger className="w-[200px] h-8 text-xs font-medium">
                                <SelectValue placeholder="Seleccionar empresa" />
                            </SelectTrigger>
                            <SelectContent>
                                {companiesData.content.map(c => (
                                    <SelectItem key={c.id} value={c.id} className="text-xs">
                                        {c.businessName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpisData.map((kpi, idx) => (
                    <Card key={idx} className="border-border shadow-sm relative overflow-hidden">
                        <CardContent className="p-6">
                            <p className="text-sm font-semibold text-muted-foreground mb-2">{kpi.title}</p>
                            <h3 className="text-3xl font-bold text-foreground mb-2">{kpi.value}</h3>
                            <div className={`text-xs font-medium flex items-center gap-1.5 ${kpi.trendType === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                                }`}>
                                <span>{kpi.trend}</span>
                            </div>

                            <div className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center">
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Card */}
            <Card className="border-border shadow-sm">
                <div className="border-b border-border p-0">
                    <div className="flex items-center justify-between px-6 pt-4 gap-4 flex-nowrap overflow-x-auto">
                        {/* Tabs with Counts */}
                        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
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

                        {/* Search, Export and Create Actions in unified single-line toolbar */}
                        <div className="flex items-center gap-2 mb-2.5 shrink-0">
                            <div className="relative w-44 sm:w-56">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre, cargo..."
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
                                onClick={() => exportEmployeesToExcel(filteredEmployees)}
                                disabled={filteredEmployees.length === 0}
                            >
                                <DownloadCloud className="w-3.5 h-3.5 mr-1 text-primary" />
                                Exportar
                            </Button>
                            <Button
                                size="sm"
                                className="h-8 text-xs font-medium shadow-sm px-3"
                                onClick={() => {
                                    setEmployeeToEdit(null);
                                    setIsModalOpen(true);
                                }}
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Nuevo Empleado
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    <EmployeesTable
                        employees={filteredEmployees}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                    />
                </div>
            </Card>

            {!isLoading && totalPages > 1 && (
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

            <EmployeeFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employeeToEdit={employeeToEdit}
            />
        </div>
    );
};
