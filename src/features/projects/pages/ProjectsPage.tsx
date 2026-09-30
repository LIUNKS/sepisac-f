import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const projectsData = [
    { id: 1, name: 'Planta Minera Cerro Verde', date: '15 Jul 2026', client: 'Cerro Verde SAA', engineer: 'R. Torres', status: 'En progreso', progress: 65 },
    { id: 2, name: 'Mantenimiento Bombas Hidráulicas', date: '02 Jul 2026', client: 'Petroperú', engineer: 'M. Quispe', status: 'Completado', progress: 100 },
    { id: 3, name: 'Instalación Línea Eléctrica HV', date: '22 Jul 2026', client: 'Antamina S.A.', engineer: 'L. Flores', status: 'Pendiente', progress: 0 },
    { id: 4, name: 'Construcción Estructura Metálica', date: '18 Jul 2026', client: 'SiderPerú', engineer: 'R. Torres', status: 'En progreso', progress: 40 },
];

export const ProjectsPage = () => {
    const [activeTab, setActiveTab] = useState('Todos');

    const tabs = [
        { id: 'Todos', label: 'Todos los Proyectos (24)' },
        { id: 'En progreso', label: 'En progreso (8)' },
        { id: 'Completados', label: 'Completados (12)' },
        { id: 'Pendientes', label: 'Pendientes (4)' },
    ];

    return (
        <div className="space-y-6">
            <Card className="border-border shadow-sm">
                <CardHeader className="p-0 border-b border-border">
                    <div className="flex justify-between items-center px-6 mt-4">
                        <div className="flex gap-6">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                                        activeTab === tab.id 
                                            ? 'border-primary text-primary' 
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 mb-3 h-8 text-sm">
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Filtrar tabla
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent bg-secondary/20">
                                <TableHead className="text-muted-foreground font-semibold px-6">Proyecto</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Cliente</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Ingeniero</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Estado</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Avance</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right px-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projectsData.map((project) => (
                                <TableRow key={project.id} className="border-border/50 hover:bg-muted/50">
                                    <TableCell className="px-6 py-4">
                                        <div className="font-semibold text-foreground">{project.name}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{project.date}</div>
                                    </TableCell>
                                    <TableCell className="text-foreground font-medium">{project.client}</TableCell>
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
                                    <TableCell className="w-48">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${
                                                        project.progress === 100 ? 'bg-emerald-500' : 
                                                        project.progress === 0 ? 'bg-amber-400' : 'bg-blue-600'
                                                    }`}
                                                    style={{ width: `${project.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground w-8 text-right">{project.progress}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                                                <Pencil className="w-4 h-4" />
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
