import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { AuditLogResponseDTO } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditLogDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: AuditLogResponseDTO | null;
}

export const AuditLogDetailsModal = ({ isOpen, onClose, log }: AuditLogDetailsModalProps) => {
    if (!log) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Detalle de Auditoría</DialogTitle>
                    <DialogDescription>
                        Registro de la acción realizada el {format(new Date(log.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Usuario</p>
                        <p className="text-sm">{log.user?.fullName} ({log.user?.email})</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Acción</p>
                        <p className="text-sm font-semibold">{log.action}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Módulo Afectado</p>
                        <p className="text-sm">{log.moduleAffected}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">ID Entidad</p>
                        <p className="text-xs font-mono bg-muted p-1 rounded break-all">{log.entityId}</p>
                    </div>
                </div>
                
                <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Descripción</p>
                    <p className="text-sm bg-muted/50 p-2 rounded-md">{log.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Valores Anteriores
                        </h4>
                        <div className="h-[250px] w-full rounded-md border bg-slate-950 p-4">
                            <pre className="text-xs text-slate-50 font-mono">
                                {log.oldValues ? JSON.stringify(log.oldValues, null, 2) : 'No hay datos anteriores.'}
                            </pre>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Valores Nuevos
                        </h4>
                        <div className="h-[250px] w-full rounded-md border bg-slate-950 p-4">
                            <pre className="text-xs text-slate-50 font-mono">
                                {log.newValues ? JSON.stringify(log.newValues, null, 2) : 'No hay datos nuevos.'}
                            </pre>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t mt-4">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

