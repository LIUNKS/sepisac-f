import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Download, 
    Share2, 
    FileText, 
    Filter, 
    Calendar, 
    RefreshCcw, 
    Search,
    ChevronDown
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

const reportsData = [
    { id: 'REP-1045', name: 'Avance Proyectos Mineros', module: 'Proyectos', generatedBy: 'Mayra Yaranga', date: '03 Sep 2026 - 10:15 AM', format: 'PDF' },
    { id: 'REP-1044', name: 'Valorización de Almacén T3', module: 'Inventario', generatedBy: 'Yohann Camiloaga', date: '02 Sep 2026 - 16:45 PM', format: 'EXCEL' },
    { id: 'REP-1043', name: 'Cierre Operativo Agosto 2026', module: 'Proyectos', generatedBy: 'Gerencia SEPI', date: '01 Sep 2026 - 09:00 AM', format: 'PDF' },
    { id: 'REP-1042', name: 'Cotizaciones Aprobadas Q3', module: 'Cotizaciones', generatedBy: 'Renzo Gutiérrez', date: '30 Ago 2026 - 11:30 AM', format: 'PDF' },
];

const barData = [
    { name: 'Abr', cotizaciones: 40, proyectos: 25 },
    { name: 'May', cotizaciones: 60, proyectos: 45 },
    { name: 'Jun', cotizaciones: 55, proyectos: 50 },
    { name: 'Jul', cotizaciones: 80, proyectos: 70 },
    { name: 'Ago', cotizaciones: 95, proyectos: 85 },
    { name: 'Sep', cotizaciones: 30, proyectos: 10 },
];

const donutData = [
    { name: 'Stock Normal', value: 45, color: 'hsl(var(--primary))' },
    { name: 'Material Asignado', value: 30, color: '#16a34a' },
    { name: 'Bajo Stock / Alerta', value: 25, color: 'hsl(var(--muted))' },
];

export const ReportesPage = () => {
    return (
        <div className="space-y-6">
            
            {/* Filters Bar */}
            <Card className="border-border shadow-sm">
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filtrar datos:
                        </div>
                        
                        <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                            <span className="text-sm text-foreground">Módulo: Todos</span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                        
                        <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">Desde: 01 Sep 2026</span>
                        </div>
                        
                        <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">Hasta: 03 Sep 2026</span>
                        </div>
                    </div>
                    
                    <Button variant="outline" className="w-full md:w-auto text-foreground shrink-0 border-border hover:bg-secondary/50">
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Actualizar
                    </Button>
                </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Bar Chart */}
                <Card className="col-span-1 lg:col-span-2 border-border shadow-sm">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <div>
                            <CardTitle className="text-base font-bold text-foreground">Rendimiento Operativo</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">Cotizaciones vs Proyectos completados (Últimos 6 meses)</CardDescription>
                        </div>
                        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1 cursor-pointer">
                            Semestral <ChevronDown className="w-3 h-3" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                                    <Tooltip 
                                        cursor={{fill: 'hsl(var(--muted))', opacity: 0.2}}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="cotizaciones" name="Cotizaciones" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="proyectos" name="Proyectos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex gap-6 justify-center mt-6">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <div className="w-3 h-3 rounded bg-muted"></div> Cotizaciones
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <div className="w-3 h-3 rounded bg-primary"></div> Proyectos
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Donut Chart */}
                <Card className="border-border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold text-foreground">Resumen de Inventario</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Distribución del stock actual</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="h-[160px] w-full relative mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={donutData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {donutData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-bold text-foreground">1,248</span>
                                <span className="text-[10px] text-muted-foreground">Artículos</span>
                            </div>
                        </div>
                        
                        <div className="w-full space-y-3 mt-6">
                            {donutData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs font-medium">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                                        {item.name}
                                    </div>
                                    <span className="text-foreground">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table Card */}
            <Card className="border-border shadow-sm">
                <CardHeader className="p-0 border-b border-border">
                    <div className="flex justify-between items-center p-4">
                        <div className="text-base font-bold text-foreground">Historial de Reportes Generados</div>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar reporte..." 
                                className="h-8 pl-9 w-[200px] bg-secondary/20 border-border text-sm"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent bg-secondary/20">
                                <TableHead className="text-muted-foreground font-semibold px-6">ID Reporte</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Nombre del Documento</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Módulo</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Generado Por</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Fecha de Emisión</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Formato</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right px-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportsData.map((report) => (
                                <TableRow key={report.id} className="border-border/50 hover:bg-muted/50">
                                    <TableCell className="px-6 py-4 text-muted-foreground font-medium text-xs">
                                        {report.id}
                                    </TableCell>
                                    <TableCell className="font-semibold text-foreground">
                                        {report.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {report.module}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                {report.generatedBy.split(' ').map(n => n[0]).join('').substring(0,2)}
                                            </div>
                                            <span className="font-medium text-foreground">{report.generatedBy}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{report.date}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant="secondary" 
                                            className={`gap-1.5 ${
                                                report.format === 'PDF' 
                                                    ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20' 
                                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
                                            }`}
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            {report.format}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                                                <Share2 className="w-4 h-4" />
                                            </Button>
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
