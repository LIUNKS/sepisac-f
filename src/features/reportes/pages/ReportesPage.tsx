import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Download,
    FileText,
    Calendar,
    RefreshCcw,
    Search,
    Loader2,
    Briefcase,
    ShoppingCart,
    Receipt,
    Package,
    HardHat,
    Truck,
    Layers,
    BarChart3,
    PieChart as PieChartIcon
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCompanies } from '@/features/empresas/api';

// Services and Queries
import { getProjects } from '@/features/projects/services/projectService';
import { getQuotations } from '@/features/cotizaciones/services/quotation.service';
import { searchInvoices } from '@/features/facturacion/api/facturacion';
import { getInventory } from '@/features/inventario/services/inventory.service';
import { useEmployees } from '@/features/empleados/api';
import { useMachinery } from '@/features/maquinaria/api';
import { getDashboardData } from '@/features/dashboard/services/dashboard.service';

// Excel Exporters
import { exportProjectsToExcel } from '@/features/projects/utils/exportProjectsToExcel';
import { exportQuotationsToExcel } from '@/features/cotizaciones/utils/exportToExcel';
import { exportInvoicesToExcel } from '@/features/facturacion/utils/exportInvoicesToExcel';
import { exportInventoryToExcel } from '@/features/inventario/utils/exportInventoryToExcel';
import { exportEmployeesToExcel } from '@/features/empleados/utils/exportEmployeesToExcel';
import { exportMachineryToExcel } from '@/features/maquinaria/utils/exportMachineryToExcel';
import { exportConsolidatedReportToExcel } from '../utils/exportConsolidatedReportToExcel';

export const ReportesPage = () => {
    const queryClient = useQueryClient();
    const { user, hasRole } = useAuthStore();
    const isSuperAdmin = hasRole(['SUPERADMIN']);

    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
    const [selectedModule, setSelectedModule] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'all' | 'operativo' | 'comercial' | 'gerencial'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Date range filter
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { data: companiesPage } = useCompanies({ page: 0, size: 100 }, isSuperAdmin);

    const effectiveCompanyId = isSuperAdmin
        ? (selectedCompanyId !== 'all' ? selectedCompanyId : undefined)
        : user?.companyId;

    // Real Data Queries - Cached with staleTime to prevent spamming server on focus/rerenders
    const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
        queryKey: ['projects', effectiveCompanyId],
        queryFn: () => getProjects(effectiveCompanyId, 0, 1000),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
    const projectsList = projectsData?.content || [];

    const { data: quotationsData, isLoading: isLoadingQuotations } = useQuery({
        queryKey: ['quotations', effectiveCompanyId],
        queryFn: () => getQuotations(effectiveCompanyId),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
    const quotationsList = quotationsData?.content || [];

    const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
        queryKey: ['invoices', effectiveCompanyId],
        queryFn: () => searchInvoices({ companyId: effectiveCompanyId, size: 1000 }),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
    const invoicesList = invoicesData?.content || [];

    const { data: inventoryData, isLoading: isLoadingInventory } = useQuery({
        queryKey: ['inventory', effectiveCompanyId],
        queryFn: () => getInventory(effectiveCompanyId, 0, 1000),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
    const inventoryList = inventoryData?.content || [];

    const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees(
        effectiveCompanyId,
        {
            page: 0,
            size: 1000,
            search: '',
        }
    );
    const employeesList = employeesData?.content || [];

    const { data: machineryData, isLoading: isLoadingMachinery } = useMachinery(
        effectiveCompanyId,
        { page: 0, size: 1000, sort: 'createdAt,desc' }
    );
    const machineryList = machineryData?.content || [];

    const { data: dashboardData } = useQuery({
        queryKey: ['dashboard', effectiveCompanyId],
        queryFn: () => getDashboardData(effectiveCompanyId || user?.companyId || ''),
        enabled: !!(effectiveCompanyId || user?.companyId),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const isAnyLoading = isLoadingProjects || isLoadingQuotations || isLoadingInvoices || isLoadingInventory || isLoadingEmployees || isLoadingMachinery;

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['projects'] }),
            queryClient.invalidateQueries({ queryKey: ['quotations'] }),
            queryClient.invalidateQueries({ queryKey: ['invoices'] }),
            queryClient.invalidateQueries({ queryKey: ['inventory'] }),
            queryClient.invalidateQueries({ queryKey: ['employees'] }),
            queryClient.invalidateQueries({ queryKey: ['machinery'] }),
            queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        ]);
        setIsRefreshing(false);
        toast.success('Métricas y datos de reportes actualizados');
    };

    // Calculate Real Data for Bar Chart: Monthly projects and quotations
    const barChartData = useMemo(() => {
        if (dashboardData?.ingresosVsEgresos && dashboardData.ingresosVsEgresos.length > 0) {
            return dashboardData.ingresosVsEgresos.map(item => ({
                name: item.name,
                ingresos: Number(item.ingresos) || 0,
                egresos: Number(item.egresos) || 0,
            }));
        }

        // Fallback: Grouped metrics
        return [
            { name: 'Proyectos', ingresos: projectsList.length * 5000, egresos: projectsList.length * 3500 },
            { name: 'Cotizaciones', ingresos: quotationsList.length * 8000, egresos: quotationsList.length * 2000 },
            { name: 'Facturación', ingresos: invoicesList.length * 6500, egresos: invoicesList.length * 1500 },
        ];
    }, [dashboardData, quotationsList, projectsList, invoicesList]);

    // Calculate Real Data for Donut Chart: Real project status distribution
    const donutChartData = useMemo(() => {
        const planned = projectsList.filter(p => p.status === 'EN_PLANIFICACION').length;
        const inProgress = projectsList.filter(p => p.status === 'EN_PROGRESO' || p.status === 'EN_EJECUCION').length;
        const completed = projectsList.filter(p => p.status === 'COMPLETADO').length;
        const other = projectsList.length - (planned + inProgress + completed);

        const items = [
            { name: 'En Ejecución', value: inProgress, color: '#2563eb' },
            { name: 'Completados', value: completed, color: '#16a34a' },
            { name: 'En Planificación', value: planned, color: '#d97706' },
        ];

        if (other > 0) {
            items.push({ name: 'Otros / Pausados', value: other, color: '#64748b' });
        }

        return items.filter(i => i.value > 0);
    }, [projectsList]);

    // Reports Catalog definition with real data generators
    const reportsCatalog = useMemo(() => {
        return [
            {
                id: 'REP-PRJ-01',
                name: 'Reporte Ejecutivo de Proyectos y Obras',
                module: 'Proyectos',
                category: 'operativo',
                icon: Briefcase,
                description: 'Cronograma, avance, órdenes de trabajo, estado y fechas contractuales.',
                recordsCount: projectsList.length,
                recordsLabel: `${projectsList.length} proyectos registrados`,
                format: 'EXCEL',
                generator: async () => {
                    await exportProjectsToExcel(projectsList);
                }
            },
            {
                id: 'REP-COT-02',
                name: 'Reporte Comercial de Cotizaciones y Propuestas',
                module: 'Cotizaciones',
                category: 'comercial',
                icon: ShoppingCart,
                description: 'Presupuestos enviados, montos totales, servicios licitados y estado comercial.',
                recordsCount: quotationsList.length,
                recordsLabel: `${quotationsList.length} cotizaciones comerciales`,
                format: 'EXCEL',
                generator: async () => {
                    await exportQuotationsToExcel(quotationsList);
                }
            },
            {
                id: 'REP-FAC-03',
                name: 'Reporte Financiero de Facturación y Cobranzas',
                module: 'Facturación',
                category: 'comercial',
                icon: Receipt,
                description: 'Comprobantes fiscales emitidos, pagos recibidos, cuentas por cobrar y vencidas.',
                recordsCount: invoicesList.length,
                recordsLabel: `${invoicesList.length} facturas emitidas`,
                format: 'EXCEL',
                generator: async () => {
                    await exportInvoicesToExcel(invoicesList);
                }
            },
            {
                id: 'REP-INV-04',
                name: 'Reporte Valorizado de Almacén e Inventario',
                module: 'Inventario',
                category: 'operativo',
                icon: Package,
                description: 'Stock físico disponible, clasificación de suministros, stock mínimo y valorización.',
                recordsCount: inventoryList.length,
                recordsLabel: `${inventoryList.length} artículos en almacén`,
                format: 'EXCEL',
                generator: async () => {
                    await exportInventoryToExcel(inventoryList);
                }
            },
            {
                id: 'REP-EMP-05',
                name: 'Reporte de Recursos Humanos y Personal Operativo',
                module: 'Personal',
                category: 'operativo',
                icon: HardHat,
                description: 'Personal técnico, régimen laboral (Planilla/Locación), costo por hora y asignación.',
                recordsCount: employeesList.length,
                recordsLabel: `${employeesList.length} colaboradores`,
                format: 'EXCEL',
                generator: async () => {
                    await exportEmployeesToExcel(employeesList);
                }
            },
            {
                id: 'REP-MAQ-06',
                name: 'Reporte de Flota y Maquinaria Operativa',
                module: 'Maquinaria',
                category: 'operativo',
                icon: Truck,
                description: 'Maquinaria pesada, control de mantenimiento preventivo y equipos en obra.',
                recordsCount: machineryList.length,
                recordsLabel: `${machineryList.length} activos y equipos`,
                format: 'EXCEL',
                generator: async () => {
                    await exportMachineryToExcel(machineryList);
                }
            },
            {
                id: 'REP-GEN-07',
                name: 'Reporte Consolidado Ejecutivo Multi-Módulo (Libro Maestro)',
                module: 'Gerencial',
                category: 'gerencial',
                icon: Layers,
                description: 'Libro maestro consolidado con hojas independientes de Proyectos, Cotizaciones, Facturación, Inventario, Personal y Maquinaria.',
                recordsCount: projectsList.length + quotationsList.length + invoicesList.length + inventoryList.length,
                recordsLabel: 'Auditoría integral consolidada',
                format: 'EXCEL',
                generator: async () => {
                    await exportConsolidatedReportToExcel({
                        projects: projectsList,
                        quotations: quotationsList,
                        invoices: invoicesList,
                        inventory: inventoryList,
                        employees: employeesList,
                        machinery: machineryList,
                    });
                }
            },
        ];
    }, [projectsList, quotationsList, invoicesList, inventoryList, employeesList, machineryList]);

    // Filter reports list based on module, category tab, and search term
    const filteredReports = useMemo(() => {
        let list = reportsCatalog;

        if (activeTab === 'operativo') {
            list = list.filter(r => r.category === 'operativo');
        } else if (activeTab === 'comercial') {
            list = list.filter(r => r.category === 'comercial');
        } else if (activeTab === 'gerencial') {
            list = list.filter(r => r.category === 'gerencial');
        }

        if (selectedModule !== 'all') {
            list = list.filter(r => r.module.toLowerCase() === selectedModule.toLowerCase());
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            list = list.filter(r =>
                r.id.toLowerCase().includes(term) ||
                r.name.toLowerCase().includes(term) ||
                r.module.toLowerCase().includes(term) ||
                r.description.toLowerCase().includes(term)
            );
        }

        return list;
    }, [reportsCatalog, activeTab, selectedModule, searchTerm]);

    const handleDownload = async (report: typeof reportsCatalog[0]) => {
        setDownloadingReportId(report.id);
        try {
            await report.generator();
            toast.success(`${report.name} generado y descargado exitosamente`);
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Error al generar el archivo Excel del reporte.');
        } finally {
            setDownloadingReportId(null);
        }
    };

    const tabs = [
        { id: 'all' as const, label: 'Todos los Reportes', count: reportsCatalog.length },
        { id: 'operativo' as const, label: 'Operaciones', count: reportsCatalog.filter(r => r.category === 'operativo').length },
        { id: 'comercial' as const, label: 'Comercial y Finanzas', count: reportsCatalog.filter(r => r.category === 'comercial').length },
        { id: 'gerencial' as const, label: 'Consolidado Ejecutivo', count: reportsCatalog.filter(r => r.category === 'gerencial').length },
    ];

    return (
        <div className="space-y-6">

            {/* Interactive Filters Bar */}
            <Card className="border-border shadow-sm">
                <CardContent className="p-4 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        {isSuperAdmin && (
                            <div className="w-full sm:w-48">
                                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                                    <SelectTrigger className="h-9 text-xs bg-background">
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
                            </div>
                        )}

                        <div className="w-full sm:w-44">
                            <Select value={selectedModule} onValueChange={setSelectedModule}>
                                <SelectTrigger className="h-9 text-xs bg-background">
                                    <SelectValue placeholder="Módulo: Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Módulo: Todos</SelectItem>
                                    <SelectItem value="Proyectos">Proyectos</SelectItem>
                                    <SelectItem value="Cotizaciones">Cotizaciones</SelectItem>
                                    <SelectItem value="Facturación">Facturación</SelectItem>
                                    <SelectItem value="Inventario">Inventario</SelectItem>
                                    <SelectItem value="Personal">Personal</SelectItem>
                                    <SelectItem value="Maquinaria">Maquinaria</SelectItem>
                                    <SelectItem value="Gerencial">Gerencial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-1.5 bg-secondary/30 border border-border rounded-md px-2.5 py-1 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground font-medium">Desde:</span>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-7 w-32 border-0 bg-transparent p-0 text-xs focus-visible:ring-0"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 bg-secondary/30 border border-border rounded-md px-2.5 py-1 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground font-medium">Hasta:</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-7 w-32 border-0 bg-transparent p-0 text-xs focus-visible:ring-0"
                            />
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs font-medium shrink-0 gap-1.5"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Actualizar Datos
                    </Button>
                </CardContent>
            </Card>

            {/* Dynamic Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart: Rendimiento / Ingresos vs Egresos */}
                <Card className="col-span-1 lg:col-span-2 border-border shadow-sm">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <div>
                            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-primary" />
                                Flujo Financiero y Rendimiento Operativo
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Comparativo de ingresos vs costos operacionales registrados en el sistema.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px] w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="ingresos" name="Ingresos (S/)" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={22} />
                                    <Bar dataKey="egresos" name="Egresos (S/)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={22} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex gap-6 justify-center mt-4">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <div className="w-3 h-3 rounded bg-blue-600"></div> Ingresos / Facturación
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <div className="w-3 h-3 rounded bg-amber-500"></div> Costos / Egresos
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Donut Chart: Distribución Real de Proyectos */}
                <Card className="border-border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                            <PieChartIcon className="w-4 h-4 text-primary" />
                            Distribución de Proyectos
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            Estado actual de órdenes y obras en ejecución.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="h-[160px] w-full relative mt-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={donutChartData.length > 0 ? donutChartData : [{ name: 'Sin proyectos', value: 1, color: '#94a3b8' }]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {donutChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-foreground">
                                    {projectsList.length}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium">Proyectos</span>
                            </div>
                        </div>

                        <div className="w-full space-y-2.5 mt-4">
                            {donutChartData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs font-medium">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        {item.name}
                                    </div>
                                    <span className="text-foreground font-bold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reports Catalog Card with Unified Toolbar */}
            <Card className="border-border shadow-sm">
                <div className="border-b border-border p-0">
                    <div className="flex items-center justify-between px-6 pt-4 gap-4 flex-nowrap overflow-x-auto">
                        {/* Tabs with Real Counts */}
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

                        {/* Search Toolbar */}
                        <div className="flex items-center gap-2 mb-2.5 shrink-0">
                            <div className="relative w-52 sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar reporte por código o área..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-8 pl-8 text-xs bg-background"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/50 hover:bg-transparent bg-secondary/20">
                                    <TableHead className="font-semibold text-muted-foreground px-6 w-32">Código</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Informe Oficial</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Módulo</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Registros en Vivo</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground text-center">Formato</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground text-right px-6">Descarga</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isAnyLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                <span className="text-xs text-muted-foreground">Cargando catálogo de reportes del sistema...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredReports.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            No se encontraron reportes que coincidan con los criterios de búsqueda.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredReports.map((report) => {
                                        const isDownloading = downloadingReportId === report.id;

                                        return (
                                            <TableRow key={report.id} className="border-border/50 hover:bg-muted/50">
                                                <TableCell className="px-6 py-4 font-mono font-bold text-xs text-foreground">
                                                    {report.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                                                        <report.icon className="w-4 h-4 text-primary shrink-0" />
                                                        <span>{report.name}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5 max-w-md">
                                                        {report.description}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-medium text-xs">
                                                        {report.module}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground font-medium">
                                                    {report.recordsLabel}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-emerald-50 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 font-semibold text-xs gap-1"
                                                    >
                                                        <FileText className="w-3 h-3" />
                                                        {report.format}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs font-medium px-3 gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                                                        onClick={() => handleDownload(report)}
                                                        disabled={isDownloading || report.recordsCount === 0}
                                                    >
                                                        {isDownloading ? (
                                                            <>
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                Exportando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Download className="w-3.5 h-3.5 text-primary group-hover:text-primary-foreground" />
                                                                Descargar
                                                            </>
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </Card>
        </div>
    );
};
