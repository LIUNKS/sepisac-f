import { useAuthStore } from '@/app/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
    TrendingUp, 
    TrendingDown, 
    FileText, 
    HardHat, 
    ArrowUpRight,
    ArrowDownRight,
    Download,
    CalendarDays,
    Database
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboardData, seedDashboardData } from '../services/dashboard.service';
import { toast } from 'sonner';

export const DashboardPage = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard', user?.companyId],
        queryFn: () => getDashboardData(user?.companyId || ''),
        enabled: !!user?.companyId
    });

    const seedMutation = useMutation({
        mutationFn: () => seedDashboardData(user?.companyId || ''),
        onSuccess: () => {
            toast.success('Datos de prueba generados exitosamente');
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        onError: () => {
            toast.error('Error al generar los datos de prueba');
        }
    });

    if (isLoading) {
        return <div className="text-center py-10 text-muted-foreground">Cargando dashboard...</div>;
    }

    if (error || !data) {
        return <div className="text-center py-10 text-red-500">Error al cargar el dashboard</div>;
    }

    // Calcular el total de los proyectos para el porcentaje
    const totalProjects = data.estadoProyectos.reduce((acc, curr) => acc + curr.value, 0);

    const handleExport = () => {
        toast.info("Generando reporte PDF del Dashboard...");
        // Logica real de exportacion iria aqui
        setTimeout(() => toast.success("Reporte descargado correctamente"), 1500);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Resumen General</h2>
                    <p className="text-muted-foreground text-sm">Vista general de tus indicadores clave</p>
                </div>
                <div className="flex items-center gap-2">
                    {totalProjects === 0 && (
                        <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} className="gap-2">
                            <Database className="w-4 h-4" />
                            {seedMutation.isPending ? 'Generando...' : 'Generar Datos'}
                        </Button>
                    )}
                    <Button variant="outline" className="gap-2 text-muted-foreground hidden sm:flex">
                        <CalendarDays className="w-4 h-4" />
                        Últimos 8 meses
                    </Button>
                    <Button onClick={handleExport} className="gap-2">
                        <Download className="w-4 h-4" />
                        Exportar Reporte
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-border shadow-sm bg-blue-600 text-white">
                    <CardContent className="p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-blue-100">Ingresos Mensuales</p>
                            <h3 className="text-2xl font-bold mt-1">
                                {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(data.ingresosMensuales)}
                            </h3>
                            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-100">
                                {data.ingresosTrend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                <span>{data.ingresosTrend > 0 ? '+' : ''}{data.ingresosTrend.toFixed(1)}% vs mes anterior</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/50 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm">
                    <CardContent className="p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Egresos Mensuales</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">
                                {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(data.egresosMensuales)}
                            </h3>
                            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${data.egresosTrend <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {data.egresosTrend <= 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                <span>{data.egresosTrend > 0 ? '+' : ''}{data.egresosTrend.toFixed(1)}%</span>
                                <span className="text-muted-foreground ml-1">vs mes anterior</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center">
                            <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm">
                    <CardContent className="p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Cotizaciones Aprobadas</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{data.cotizacionesAprobadas}</h3>
                            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${data.cotizacionesTrend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {data.cotizacionesTrend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                <span>{data.cotizacionesTrend >= 0 ? '+' : ''}{data.cotizacionesTrend} este mes</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm">
                    <CardContent className="p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Proyectos Activos</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{data.proyectosActivos}</h3>
                            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                                <ArrowUpRight className="w-4 h-4" />
                                <span>{data.proyectosTerminanPronto} finalizan pronto</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <HardHat className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-8">
                        <div>
                            <CardTitle className="text-lg font-bold text-foreground">Ingresos vs Egresos (Miles)</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Últimos 8 meses</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-600"></span> Ingresos
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-400"></span> Egresos
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.ingresosVsEgresos} barSize={12}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.7, fontSize: 12}} dy={10} />
                                    <YAxis hide />
                                    <RechartsTooltip 
                                        cursor={{fill: 'hsl(var(--muted))', opacity: 0.5}} 
                                        formatter={(value: number) => [`S/ ${(value * 1000).toLocaleString()}`, undefined]}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))', 
                                            color: 'hsl(var(--foreground))',
                                            borderRadius: '8px', 
                                            borderColor: 'hsl(var(--border))', 
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }} 
                                    />
                                    <Bar dataKey="ingresos" fill="#0062ff" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="egresos" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-foreground">Estado de Proyectos</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Total registrados: {totalProjects}</p>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="h-[180px] w-full relative">
                            {totalProjects > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.estadoProyectos}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {data.estadoProyectos.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))', 
                                                color: 'hsl(var(--foreground))',
                                                borderRadius: '8px', 
                                                borderColor: 'hsl(var(--border))', 
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }} 
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full rounded-full border-[20px] border-muted flex items-center justify-center"></div>
                            )}
                            
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-foreground">{totalProjects}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</span>
                            </div>
                        </div>

                        <div className="w-full mt-6 space-y-3">
                            {data.estadoProyectos.map(item => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-foreground/80">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></span>
                                        {item.name}
                                    </div>
                                    <div className="font-medium text-foreground">
                                        {item.value} <span className="text-muted-foreground font-normal ml-1">
                                            {totalProjects > 0 ? Math.round((item.value/totalProjects)*100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row - Table */}
            <Card className="border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold text-foreground">Proyectos Recientes</CardTitle>
                    <a href="/proyectos" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Ver todos <ArrowUpRight className="w-4 h-4" />
                    </a>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="text-muted-foreground font-semibold">Proyecto</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Cliente</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Fechas</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.proyectosRecientes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                        No hay proyectos recientes para mostrar
                                    </TableCell>
                                </TableRow>
                            ) : data.proyectosRecientes.map((project) => (
                                <TableRow key={project.id} className="border-border/50 hover:bg-muted/50">
                                    <TableCell>
                                        <div className="font-semibold text-foreground">{project.title}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{project.code}</div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{project.clientName}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {project.startDate || '-'} / {project.endDate || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant="secondary" 
                                            className={
                                                project.status === 'EN PROGRESO' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20' :
                                                project.status === 'COMPLETADO' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20' :
                                                'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20'
                                            }
                                        >
                                            {project.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};