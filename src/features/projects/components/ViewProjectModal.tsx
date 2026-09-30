import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, ClipboardList, Info, FileText } from 'lucide-react';
import type { Project } from '../types';

interface ViewProjectModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ViewProjectModal = ({ project, isOpen, onClose }: ViewProjectModalProps) => {
    if (!project) return null;

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'No definida';
        return new Intl.DateTimeFormat('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(new Date(dateStr));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-card border-border shadow-lg">
                <DialogHeader className="border-b border-border pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <ClipboardList className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-foreground">
                                    {project.title}
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1 font-medium">
                                    {project.code}
                                </p>
                            </div>
                        </div>
                        <Badge 
                            variant="secondary" 
                            className={
                                project.status === 'EN PROGRESO' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                                project.status === 'COMPLETADO' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                            }
                        >
                            {project.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6 py-4">
                    <div className="space-y-6">
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Info className="w-4 h-4 text-primary" />
                                Informacin General
                            </h4>
                            <div className="space-y-3 bg-secondary/20 p-4 rounded-lg border border-border/50">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Cliente</p>
                                    <p className="text-sm font-medium flex items-center gap-2 text-foreground">
                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                        {project.clientName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Cotizacin Vinculada</p>
                                    <p className="text-sm font-medium flex items-center gap-2 text-foreground">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                        ID: {project.quotationId.split('-')[0]}...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Calendar className="w-4 h-4 text-primary" />
                                Cronograma
                            </h4>
                            <div className="space-y-3 bg-secondary/20 p-4 rounded-lg border border-border/50">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Fecha de Inicio</p>
                                    <p className="text-sm font-medium text-foreground">{formatDate(project.startDate)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Fecha Estimada Fin</p>
                                    <p className="text-sm font-medium text-foreground">{formatDate(project.endDate)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Descripcin</h4>
                        <div className="bg-secondary/20 p-4 rounded-lg border border-border/50">
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                {project.description || 'Sin descripcin disponible.'}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
