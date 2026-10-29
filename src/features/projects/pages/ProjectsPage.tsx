import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    Eye, Pencil, Wrench, Plus, DownloadCloud, Search, 
    Briefcase, CheckCircle2, Clock, Activity, X, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAuthStore } from '@/app/store/useAuthStore';
import { useCompanies } from '@/features/empresas/api';
import { getProjects } from '../services/projectService';
import { ViewProjectModal } from '../components/ViewProjectModal';
import { EditProjectModal } from '../components/EditProjectModal';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { ProjectExecutionModal } from '../components/ProjectExecutionModal';
import { exportProjectsToExcel } from '../utils/exportProjectsToExcel';
import type { Project } from '../types';

const isStatusMatching = (status: string, tabId: string): boolean => {
    if (tabId === 'Todos') return true;
    const norm = (status || '').toUpperCase().trim();
    if (tabId === 'EN_PROCESO') {
        return norm === 'EN_PROCESO' || norm === 'EN PROGRESO';
    }
    if (tabId === 'COMPLETADO') {
        return norm === 'COMPLETADO';
    }
    if (tabId === 'PENDIENTE') {
        return norm === 'PENDIENTE';
    }
    if (tabId === 'CANCELADO') {
        return norm === 'CANCELADO';
    }
    return norm === tabId.toUpperCase();
};

const getStatusBadge = (status: string) => {
    const norm = (status || '').toUpperCase().trim();
    if (norm === 'EN_PROCESO' || norm === 'EN PROGRESO') {
        return {
            label: 'En Proceso',
            className: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20'
        };
    }
    if (norm === 'COMPLETADO') {
        return {
            label: 'Completado',
            className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
        };
    }
    if (norm === 'CANCELADO') {
        return {
            label: 'Cancelado',
            className: 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20'
        };
    }
    return {
        label: 'Pendiente',
        className: 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20'
    };
};

export const ProjectsPage = () => {
    const { user, hasRole } = useAuthStore();
    const isSuperAdmin = hasRole(['SUPERADMIN']);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');

    const [activeTab, setActiveTab] = useState<string>('Todos');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);

    // Fetch companies for SuperAdmin dropdown
    const { data: companiesPage } = useCompanies({ page: 0, size: 100 }, isSuperAdmin);

    const effectiveCompanyId = isSuperAdmin
        ? (selectedCompanyId !== 'all' ? selectedCompanyId : undefined)
        : user?.companyId;

    const { data, isLoading, isPending, error } = useQuery({
        queryKey: ['projects', effectiveCompanyId],
        queryFn: () => getProjects(effectiveCompanyId, 0, 100),
    });

    const projects: Project[] = useMemo(() => data?.content || [], [data]);

    // Metric counts
    const totalProjects = projects.length;
    const inProgressCount = useMemo(() => projects.filter(p => isStatusMatching(p.status, 'EN_PROCESO')).length, [projects]);
    const completedCount = useMemo(() => projects.filter(p => isStatusMatching(p.status, 'COMPLETADO')).length, [projects]);
    const pendingCount = useMemo(() => projects.filter(p => isStatusMatching(p.status, 'PENDIENTE')).length, [projects]);
    const cancelledCount = useMemo(() => projects.filter(p => isStatusMatching(p.status, 'CANCELADO')).length, [projects]);

    const tabs = useMemo(() => [
        { id: 'Todos', label: 'Todos', count: totalProjects },
        { id: 'EN_PROCESO', label: 'En Proceso', count: inProgressCount },
        { id: 'PENDIENTE', label: 'Pendientes', count: pendingCount },
        { id: 'COMPLETADO', label: 'Completados', count: completedCount },
        ...(cancelledCount > 0 ? [{ id: 'CANCELADO', label: 'Cancelados', count: cancelledCount }] : []),
    ], [totalProjects, inProgressCount, pendingCount, completedCount, cancelledCount]);

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            // Status Tab Filter
            if (!isStatusMatching(p.status, activeTab)) {
                return false;
            }

            // Search Term Filter
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase().trim();
                const matchesTitle = p.title?.toLowerCase().includes(term);
                const matchesClient = p.clientName?.toLowerCase().includes(term);
                const matchesCode = p.code?.toLowerCase().includes(term);
                const matchesDescription = p.description?.toLowerCase().includes(term);
                return matchesTitle || matchesClient || matchesCode || matchesDescription;
            }

            return true;
        });
    }, [projects, activeTab, searchTerm]);

    const kpiMetrics = [
        {
            title: 'Total Proyectos',
            value: totalProjects,
            subtitle: 'Proyectos registrados',
            icon: Briefcase,
            bg: 'bg-secondary text-muted-foreground'
        },
        {
            title: 'En Proceso',
            value: inProgressCount,
            subtitle: 'Operaciones activas',
            icon: Activity,
            bg: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
        },
        {
            title: 'Completados',
            value: completedCount,
            subtitle: 'Entregados con éxito',
            icon: CheckCircle2,
            bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
        },
        {
            title: 'Pendientes',
            value: pendingCount,
            subtitle: 'Por iniciar operaciones',
            icon: Clock,
            bg: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
        }
    ];

    const handleExportExcel = () => {
        if (!filteredProjects || filteredProjects.length === 0) {
            toast.info('No hay proyectos para exportar con los filtros seleccionados');
            return;
        }
        exportProjectsToExcel(filteredProjects);
        toast.success(`Exportando ${filteredProjects.length} proyectos a Excel`);
    };

    if (error) {
        return (
            <div className="text-center py-10 text-red-500 bg-card rounded-lg border border-destructive/20 p-6">
                <p className="font-bold text-lg">Error al cargar los proyectos</p>
                <p className="text-sm mt-2 text-muted-foreground">
                    {error instanceof Error ? error.message : JSON.stringify(error)}
                </p>
            </div>
        );
    }

    if (isLoading || isPending || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm">Cargando proyectos operativos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiMetrics.map((kpi, idx) => (
                    <Card key={idx} className="border-border shadow-sm relative overflow-hidden">
                        <CardContent className="p-5">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                {kpi.title}
                            </p>
                            <h3 className="text-2xl font-bold text-foreground mb-1">
                                {kpi.value}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {kpi.subtitle}
                            </p>
                            <div className={`absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Table Card */}
            <Card className="border-border shadow-sm">
                <CardHeader className="p-0 border-b border-border">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between px-6 pt-4 gap-4">
                        {/* Status Filter Tabs */}
                        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-3.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] flex items-center gap-2 whitespace-nowrap ${
                                        activeTab === tab.id 
                                            ? 'border-primary text-primary' 
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-secondary text-muted-foreground'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search and Action Buttons Toolbar */}
                        <div className="flex flex-wrap items-center gap-2.5 pb-3">
                            {/* SuperAdmin Company Filter */}
                            {isSuperAdmin && (
                                <Select
                                    value={selectedCompanyId}
                                    onValueChange={(val) => setSelectedCompanyId(val)}
                                >
                                    <SelectTrigger className="h-8 text-xs w-40 sm:w-48 bg-background">
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

                            {/* Search Input */}
                            <div className="relative w-44 sm:w-60">
                                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por código, cliente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-8 pl-8 pr-7 text-xs bg-background"
                                />
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm('')} 
                                        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                                        title="Limpiar búsqueda"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Export to Excel Button */}
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                                onClick={handleExportExcel}
                            >
                                <DownloadCloud className="w-3.5 h-3.5 mr-1.5" />
                                Exportar Datos
                            </Button>

                            {/* Create Project Button */}
                            <Button 
                                size="sm" 
                                className="h-8 text-xs font-semibold shadow-sm"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                Nuevo Proyecto
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent bg-secondary/20">
                                <TableHead className="text-muted-foreground font-semibold px-6">Proyecto</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Cliente</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Código</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Estado</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Fechas</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right px-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProjects.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <p className="text-muted-foreground font-medium text-sm">
                                                No se encontraron proyectos para este criterio
                                            </p>
                                            {(searchTerm || activeTab !== 'Todos') && (
                                                <Button 
                                                    variant="link" 
                                                    size="sm" 
                                                    className="text-primary text-xs"
                                                    onClick={() => {
                                                        setActiveTab('Todos');
                                                        setSearchTerm('');
                                                    }}
                                                >
                                                    Limpiar filtros de búsqueda
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProjects.map((project) => {
                                    const badgeInfo = getStatusBadge(project.status);
                                    return (
                                        <TableRow key={project.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                                            <TableCell className="px-6 py-4">
                                                <div className="font-semibold text-foreground">{project.title}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{project.description || 'Sin descripción'}</div>
                                            </TableCell>
                                            <TableCell className="text-foreground font-medium">{project.clientName}</TableCell>
                                            <TableCell className="text-muted-foreground font-mono text-xs">{project.code}</TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant="secondary" 
                                                    className={badgeInfo.className}
                                                >
                                                    {badgeInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                <div className="text-xs font-medium">
                                                    {project.startDate || '-'} al {project.endDate || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                                                        title="Ver Detalles"
                                                        onClick={() => {
                                                            setSelectedProject(project);
                                                            setIsViewModalOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                                                        title="Editar Proyecto"
                                                        onClick={() => {
                                                            setSelectedProject(project);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                        title="Gestionar Recursos y Ejecución"
                                                        onClick={() => {
                                                            setSelectedProject(project);
                                                            setIsExecutionModalOpen(true);
                                                        }}
                                                    >
                                                        <Wrench className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Modals */}
            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                companyId={effectiveCompanyId || user?.companyId}
                existingProjects={projects}
            />

            <ViewProjectModal 
                project={selectedProject} 
                isOpen={isViewModalOpen} 
                onClose={() => setIsViewModalOpen(false)} 
            />
            
            <EditProjectModal 
                project={selectedProject} 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
            />

            <ProjectExecutionModal
                project={selectedProject}
                isOpen={isExecutionModalOpen}
                onClose={() => {
                    setIsExecutionModalOpen(false);
                    setSelectedProject(null);
                }}
            />
        </div>
    );
};
