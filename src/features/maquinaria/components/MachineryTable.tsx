import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, ShieldAlert, CheckCircle2, Wrench, AlertTriangle, Loader2, Truck, Calendar } from 'lucide-react';
import type { MachineryResponseDTO } from '../types';
import { useChangeMachineryStatus, useDeleteMachinery } from '../api';

interface MachineryTableProps {
    machinery: MachineryResponseDTO[];
    isLoading: boolean;
    onEdit: (item: MachineryResponseDTO) => void;
}

export const MachineryTable = ({ machinery, isLoading, onEdit }: MachineryTableProps) => {
    const { mutate: changeStatus, isPending: isChangingStatus } = useChangeMachineryStatus();
    const { mutate: deleteMachinery, isPending: isDeleting } = useDeleteMachinery();

    const [itemToDelete, setItemToDelete] = useState<MachineryResponseDTO | null>(null);

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        deleteMachinery(itemToDelete.id, {
            onSettled: () => setItemToDelete(null)
        });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            const [year, month, day] = dateStr.split('-');
            if (year && month && day) {
                return `${day}/${month}/${year}`;
            }
            return dateStr;
        } catch {
            return dateStr;
        }
    };

    const isMaintenanceSoonOrOverdue = (dateStr?: string) => {
        if (!dateStr) return false;
        try {
            const targetDate = new Date(dateStr);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 7; // Próximo en 7 días o ya vencido
        } catch {
            return false;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <span className="text-muted-foreground animate-pulse text-sm">Cargando flota y maquinaria...</span>
            </div>
        );
    }

    if (machinery.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-48 p-6 text-center">
                <Truck className="w-10 h-10 text-muted-foreground opacity-30 mb-2" />
                <span className="text-foreground font-medium">No se encontraron equipos de maquinaria</span>
                <span className="text-xs text-muted-foreground mt-1">Intenta con otro filtro o registra un nuevo equipo en el sistema.</span>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DISPONIBLE':
                return (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium text-xs gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Disponible
                    </Badge>
                );
            case 'EN_USO':
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium text-xs gap-1">
                        <ShieldAlert className="w-3 h-3" /> En Uso
                    </Badge>
                );
            case 'EN_MANTENIMIENTO':
                return (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium text-xs gap-1">
                        <Wrench className="w-3 h-3" /> En Mantenimiento
                    </Badge>
                );
            case 'DE_BAJA':
                return (
                    <Badge variant="outline" className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 font-medium text-xs gap-1">
                        <AlertTriangle className="w-3 h-3" /> De Baja
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-secondary/20 hover:bg-transparent border-border/50">
                            <TableHead className="font-semibold text-muted-foreground px-6">Código</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Equipo / Maquinaria</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Último Mantenimiento</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Próximo Mantenimiento</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Estado Operativo</TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-right px-6">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {machinery.map((item) => {
                            const isWarningDate = isMaintenanceSoonOrOverdue(item.nextMaintenanceDate);

                            return (
                                <TableRow key={item.id} className="border-border/50 hover:bg-muted/50">
                                    <TableCell className="px-6 py-4 font-mono font-bold text-foreground">
                                        {item.code}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold text-foreground">{item.name}</div>
                                        {item.companyName && (
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                Empresa: {item.companyName}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 opacity-60" />
                                            {formatDate(item.lastMaintenanceDate)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={`text-xs flex items-center gap-1.5 font-medium ${isWarningDate ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-muted-foreground'}`}>
                                            <Calendar className="w-3.5 h-3.5 opacity-60" />
                                            <span>{formatDate(item.nextMaintenanceDate)}</span>
                                            {isWarningDate && (
                                                <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded font-bold">
                                                    Revisar
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(item.status)}
                                    </TableCell>
                                    <TableCell className="text-right px-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => onEdit(item)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Editar Equipo
                                                </DropdownMenuItem>
                                                
                                                {item.status !== 'DISPONIBLE' && (
                                                    <DropdownMenuItem 
                                                        onClick={() => changeStatus({ id: item.id, status: 'DISPONIBLE' })}
                                                        disabled={isChangingStatus}
                                                    >
                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Marcar Disponible
                                                    </DropdownMenuItem>
                                                )}
                                                {item.status !== 'EN_USO' && (
                                                    <DropdownMenuItem 
                                                        onClick={() => changeStatus({ id: item.id, status: 'EN_USO' })}
                                                        disabled={isChangingStatus}
                                                    >
                                                        <ShieldAlert className="mr-2 h-4 w-4 text-blue-500" /> Marcar En Uso
                                                    </DropdownMenuItem>
                                                )}
                                                {item.status !== 'EN_MANTENIMIENTO' && (
                                                    <DropdownMenuItem 
                                                        onClick={() => changeStatus({ id: item.id, status: 'EN_MANTENIMIENTO' })}
                                                        disabled={isChangingStatus}
                                                    >
                                                        <Wrench className="mr-2 h-4 w-4 text-amber-500" /> Enviar a Taller
                                                    </DropdownMenuItem>
                                                )}
                                                {item.status !== 'DE_BAJA' && (
                                                    <DropdownMenuItem 
                                                        onClick={() => changeStatus({ id: item.id, status: 'DE_BAJA' })}
                                                        disabled={isChangingStatus}
                                                    >
                                                        <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" /> Dar de Baja
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuItem 
                                                    onClick={() => setItemToDelete(item)}
                                                    className="text-destructive focus:text-destructive mt-1 border-t"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar Equipo
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Custom Shadcn Dialog Confirmation for Delete */}
            <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 text-destructive mb-2">
                            <div className="p-2.5 rounded-full bg-destructive/10">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                            </div>
                            <DialogTitle className="text-destructive">Eliminar Equipo</DialogTitle>
                        </div>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar el equipo{' '}
                            <span className="font-semibold text-foreground">{itemToDelete?.name}</span> ({itemToDelete?.code})?
                            Esta acción realizará una baja lógica del activo en el sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setItemToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                'Sí, eliminar'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
