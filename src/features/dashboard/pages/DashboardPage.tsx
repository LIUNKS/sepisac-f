import { useAuthStore } from '@/app/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
    TrendingUp, 
    TrendingDown, 
    FileText, 
    HardHat, 
    ArrowUpRight,
    ArrowDownRight
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

const barData = [
    { name: 'Ene', ingresos: 55, egresos: 35 },
    { name: 'Feb', ingresos: 65, egresos: 45 },
    { name: 'Mar', ingresos: 45, egresos: 40 },
    { name: 'Abr', ingresos: 70, egresos: 45 },
    { name: 'May', ingresos: 60, egresos: 50 },
    { name: 'Jun', ingresos: 80, egresos: 45 },
    { name: 'Jul', ingresos: 65, egresos: 45 },
    { name: 'Ago', ingresos: 90, egresos: 55 },
];

const pieData = [
    { name: 'En progreso', value: 8, color: '#0062ff' },
    { name: 'Completados', value: 12, color: '#16a34a' },
    { name: 'Pendientes', value: 4, color: '#d97706' },
];

const projectsData = [
    { id: 1, name: 'Planta Minera Cerro Verde', date: '15 Jul 2026', client: 'Cerro Verde SAA', engineer: 'R. Torres', status: 'En progreso', progress: 65 },
    { id: 2, name: 'Mantenimiento Bombas Hidráulicas', date: '02 Jul 2026', client: 'Petroperú', engineer: 'M. Quispe', status: 'Completado', progress: 100 },
    { id: 3, name: 'Instalación Línea Eléctrica HV', date: '22 Jul 2026', client: 'Antamina S.A.', engineer: 'L. Flores', status: 'Pendiente', progress: 0 },
];

export const DashboardPage = () => {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-border shadow-sm bg-blue-600 text-white">
                    <CardContent className="p-6 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-blue-100">Ingresos Mensuales</p>
                            <h3 className="text-2xl font-bold mt-1">S/ 148,500</h3>
                            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-100">
                                <ArrowUpRight className="w-4 h-4" />
                                <span>+12.4% vs mes anterior</span>
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
                            <h3 className="text-2xl font-bold text-foreground mt-1">S/ 89,200</h3>
                            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                                <ArrowDownRight className="w-4 h-4" />
                                <span>-5.1%</span>
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
                            <h3 className="text-2xl font-bold text-foreground mt-1">7</h3>
                            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <ArrowUpRight className="w-4 h-4" />
                                <span>+3 este mes</span>
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
                            <h3 className="text-2xl font-bold text-foreground mt-1">8</h3>
                            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                                <ArrowUpRight className="w-4 h-4" />
                                <span>2 finalizan pronto</span>
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
                            <CardTitle className="text-lg font-bold text-foreground">Ingresos vs Egresos</CardTitle>
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
                                <BarChart data={barData} barSize={12}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.7, fontSize: 12}} dy={10} />
                                    <YAxis hide />
                                    <RechartsTooltip 
                                        cursor={{fill: 'hsl(var(--muted))', opacity: 0.5}} 
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
                        <p className="text-sm text-muted-foreground mt-1">Total activos: 24</p>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="h-[180px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
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
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-foreground">24</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</span>
                            </div>
                        </div>

                        <div className="w-full mt-6 space-y-3">
                            {pieData.map(item => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-foreground/80">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></span>
                                        {item.name}
                                    </div>
                                    <div className="font-medium text-foreground">
                                        {item.value} <span className="text-muted-foreground font-normal ml-1">{Math.round((item.value/24)*100)}%</span>
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
                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Ver todos <ArrowUpRight className="w-4 h-4" />
                    </a>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="text-muted-foreground font-semibold">Proyecto</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Cliente</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Ingeniero</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Estado</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right">Avance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projectsData.map((project) => (
                                <TableRow key={project.id} className="border-border/50 hover:bg-muted/50">
                                    <TableCell>
                                        <div className="font-semibold text-foreground">{project.name}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{project.date}</div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{project.client}</TableCell>
                                    <TableCell className="text-muted-foreground">{project.engineer}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant="secondary" 
                                            className={
                                                project.status === 'En progreso' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20' :
                                                project.status === 'Completado' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20' :
                                                'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20'
                                            }
                                        >
                                            {project.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right w-32">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${
                                                        project.progress === 100 ? 'bg-emerald-500' : 
                                                        project.progress === 0 ? 'bg-amber-400' : 'bg-blue-600'
                                                    }`}
                                                    style={{ width: `${project.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground w-8">{project.progress}%</span>
                                        </div>
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