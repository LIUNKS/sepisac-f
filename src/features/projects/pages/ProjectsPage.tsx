import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, SlidersHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/app/store/useAuthStore';
import { getProjects, seedProjects } from '../services/projectService';
import { ViewProjectModal } from '../components/ViewProjectModal';
import { EditProjectModal } from '../components/EditProjectModal';
import type { Project } from '../types';

export const ProjectsPage = () => {
    const [activeTab, setActiveTab] = useState('Todos');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { user } = useAuthStore();

    const { data, isLoading, isPending, error } = useQuery({
        queryKey: ['projects', user?.companyId],
        queryFn: () => getProjects(user?.companyId || '')
    });

    const queryClient = useQueryClient();
    const seedMutation = useMutation({
        mutationFn: async () => {
            if (!user?.companyId) throw new Error('No tienes empresa asignada');
            await seedProjects(user.companyId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });

    const projects = data?.content || [];

    const tabs = [
        { id: 'Todos', label: `Todos los Proyectos (${projects.length})` },
        { id: 'En progreso', label: `En progreso (${projects.filter(p => p.status === 'EN PROGRESO').length})` },
        { id: 'Completados', label: `Completados (${projects.filter(p => p.status === 'COMPLETADO').length})` },
        { id: 'Pendientes', label: `Pendientes (${projects.filter(p => p.status === 'PENDIENTE').length})` },
    ];

    const filteredProjects = projects.filter(p => {
        if (activeTab === 'Todos') return true;
        return p.status.toUpperCase() === activeTab.toUpperCase();
    });

    if (error) {
        return (
            <div className="text-center py-10 text-red-500">
                <p className="font-bold text-lg">Error al cargar los proyectos</p>
                <p className="text-sm mt-2">{error instanceof Error ? error.message : JSON.stringify(error)}</p>
            </div>
        );
    }

    if (isLoading || isPending || !data) {
        return <div className="text-center py-10 text-muted-foreground">Cargando proyectos...</div>;
    }

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
                        <div className="flex items-center gap-2 mb-3">
                            {projects.length === 0 && (
                                <Button 
                                    onClick={() => seedMutation.mutate()} 
                                    disabled={seedMutation.isPending}
                                    variant="outline" 
                                    className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 h-8 text-sm"
                                >
                                    {seedMutation.isPending ? 'Generando...' : 'Generar Datos'}
                                </Button>
                            )}
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
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Cargando proyectos...
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-red-500">
                                        Error al cargar proyectos
                                    </TableCell>
                                </TableRow>
                            ) : filteredProjects.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No hay proyectos para mostrar
                                    </TableCell>
                                </TableRow>
                            ) : filteredProjects.map((project) => (
                                <TableRow key={project.id} className="border-border/50 hover:bg-muted/50">
                                    <TableCell className="px-6 py-4">
                                        <div className="font-semibold text-foreground">{project.title}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{project.description || 'Sin descripción'}</div>
                                    </TableCell>
                                    <TableCell className="text-foreground font-medium">{project.clientName}</TableCell>
                                    <TableCell className="text-muted-foreground">{project.code}</TableCell>
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
                                    <TableCell className="text-muted-foreground">
                                        <div className="text-sm">
                                            {project.startDate || '-'} / {project.endDate || '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="w-8 h-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setIsViewModalOpen(true);
                                                }}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="w-8 h-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setIsEditModalOpen(true);
                                                }}
                                            >
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
        </div>
    );
};
