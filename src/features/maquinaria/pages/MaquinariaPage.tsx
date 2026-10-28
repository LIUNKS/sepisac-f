import { useState, useMemo } from 'react';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useMachinery } from '../api';
import { MachineryTable, MachineryFormModal } from '../components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Search,
    Plus,
    Truck,
    CheckCircle2,
    ShieldAlert,
    Wrench,
    DownloadCloud
} from 'lucide-react';
import type { MachineryResponseDTO } from '../types';
import { exportMachineryToExcel } from '../utils/exportMachineryToExcel';

export const MaquinariaPage = () => {
    const user = useAuthStore((state) => state.user);
    const hasRole = useAuthStore((state) => state.hasRole);
    const isSuperAdmin = hasRole(['SUPERADMIN']);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'DISPONIBLE' | 'EN_USO' | 'EN_MANTENIMIENTO' | 'DE_BAJA'>('all');
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [machineryToEdit, setMachineryToEdit] = useState<MachineryResponseDTO | null>(null);

    // Fetch full machinery list for the company to support instant search, exact tab counts and accurate KPIs
    const { data: allData, isLoading } = useMachinery(
        isSuperAdmin ? undefined : user?.companyId,
        {
            page: 0,
            size: 1000,
            sort: 'createdAt,desc'
        }
    );

    const allMachinery = allData?.content || [];

    // KPI Metrics
    const totalCount = allMachinery.length;
    const availableCount = allMachinery.filter(m => m.status === 'DISPONIBLE').length;
    const inUseCount = allMachinery.filter(m => m.status === 'EN_USO').length;
    const maintenanceCount = allMachinery.filter(m => m.status === 'EN_MANTENIMIENTO').length;
    const retiredCount = allMachinery.filter(m => m.status === 'DE_BAJA').length;

    const kpiMetrics = [
        {
            title: 'Total Maquinaria',
            value: totalCount,
            subtitle: 'Activos registrados',
            icon: Truck,
            color: 'text-foreground',
            bg: 'bg-secondary'
        },
        {
            title: 'Disponibles',
            value: availableCount,
            subtitle: 'Listos para asignación',
            icon: CheckCircle2,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
        },
        {
            title: 'En Uso',
            value: inUseCount,
            subtitle: 'Operando en proyectos',
            icon: ShieldAlert,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
        },
        {
            title: 'En Mantenimiento',
            value: maintenanceCount,
            subtitle: 'Revisión técnica / taller',
            icon: Wrench,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
        }
    ];

    // Filter machinery by tab and search
    const filteredMachinery = useMemo(() => {
        let list = allMachinery;

        if (activeTab !== 'all') {
            list = list.filter(m => m.status === activeTab);
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            list = list.filter(m =>
                m.code?.toLowerCase().includes(term) ||
                m.name?.toLowerCase().includes(term) ||
                m.companyName?.toLowerCase().includes(term)
            );
        }

        return list;
    }, [allMachinery, activeTab, searchTerm]);

    // Paginated slice
    const totalPages = Math.ceil(filteredMachinery.length / pageSize);
    const paginatedMachinery = useMemo(() => {
        const start = page * pageSize;
        return filteredMachinery.slice(start, start + pageSize);
    }, [filteredMachinery, page, pageSize]);

    const tabs = [
        { id: 'all' as const, label: 'Todos', count: totalCount },
        { id: 'DISPONIBLE' as const, label: 'Disponibles', count: availableCount },
        { id: 'EN_USO' as const, label: 'En Uso', count: inUseCount },
        { id: 'EN_MANTENIMIENTO' as const, label: 'Mantenimiento', count: maintenanceCount },
        { id: 'DE_BAJA' as const, label: 'De Baja', count: retiredCount },
    ];

    const handleEdit = (machinery: MachineryResponseDTO) => {
        setMachineryToEdit(machinery);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setMachineryToEdit(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiMetrics.map((kpi, idx) => (
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

            {/* Main Table Card with Unified Single-Line Toolbar */}
            <Card className="border-border shadow-sm">
                <div className="border-b border-border p-0">
                    <div className="flex items-center justify-between px-6 pt-4 gap-4 flex-nowrap overflow-x-auto">
                        {/* Tabs with Counts */}
                        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
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

                        {/* Search, Export and Create Actions in unified single-line toolbar */}
                        <div className="flex items-center gap-2 mb-2.5 shrink-0">
                            <div className="relative w-44 sm:w-56">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar código o equipo..."
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
                                onClick={() => exportMachineryToExcel(filteredMachinery)}
                                disabled={filteredMachinery.length === 0}
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
                                Nuevo Equipo
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    <MachineryTable
                        machinery={paginatedMachinery}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                    />
                </div>
            </Card>

            {/* Pagination Controls */}
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

            {/* Modal Form */}
            <MachineryFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                machineryToEdit={machineryToEdit}
            />
        </div>
    );
};
