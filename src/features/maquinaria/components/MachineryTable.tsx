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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, ShieldAlert, CheckCircle2, Wrench, AlertTriangle } from 'lucide-react';
import type { MachineryResponseDTO } from '../types';
import { useChangeMachineryStatus, useDeleteMachinery } from '../api';

interface MachineryTableProps {
    machinery: MachineryResponseDTO[];
    isLoading: boolean;
    onEdit: (item: MachineryResponseDTO) => void;
}

export const MachineryTable = ({ machinery, isLoading, onEdit }: MachineryTableProps) => {
    const { mutate: changeStatus } = useChangeMachineryStatus();
    const { mutate: deleteMachinery } = useDeleteMachinery();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48 border rounded-md bg-card">
                <span className="text-muted-foreground animate-pulse">Cargando maquinaria...</span>
            </div>
        );
    }

    if (machinery.length === 0) {
        return (
            <div className="flex justify-center items-center h-48 border rounded-md bg-card">
                <span className="text-muted-foreground">No se encontraron registros de maquinaria.</span>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DISPONIBLE':
                return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Disponible</Badge>;
            case 'EN_USO':
                return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">En Uso</Badge>;
            case 'EN_MANTENIMIENTO':
                return <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600">Mantenimiento</Badge>;
            case 'DE_BAJA':
                return <Badge variant="secondary">De Baja</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="border rounded-md bg-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Código</TableHead>
                        <TableHead>Equipo</TableHead>
                        <TableHead>Mantenimiento</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {machinery.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium font-mono text-sm">{item.code}</TableCell>
                            <TableCell>
                                <div className="font-semibold text-foreground">{item.name}</div>
                                {item.companyName && (
                                    <div className="text-[11px] text-muted-foreground mt-0.5">
                                        Empresa: {item.companyName}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="text-xs space-y-1">
                                    <div><span className="text-muted-foreground">Último:</span> {item.lastMaintenanceDate || '-'}</div>
                                    <div><span className="text-muted-foreground">Próximo:</span> {item.nextMaintenanceDate || '-'}</div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {getStatusBadge(item.status)}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menú</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(item)}>
                                            <Edit className="mr-2 h-4 w-4" /> Editar
                                        </DropdownMenuItem>
                                        
                                        {item.status !== 'DISPONIBLE' && (
                                            <DropdownMenuItem onClick={() => changeStatus({ id: item.id, status: 'DISPONIBLE' })}>
                                                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Marcar Disponible
                                            </DropdownMenuItem>
                                        )}
                                        {item.status !== 'EN_USO' && (
                                            <DropdownMenuItem onClick={() => changeStatus({ id: item.id, status: 'EN_USO' })}>
                                                <ShieldAlert className="mr-2 h-4 w-4 text-blue-500" /> Marcar En Uso
                                            </DropdownMenuItem>
                                        )}
                                        {item.status !== 'EN_MANTENIMIENTO' && (
                                            <DropdownMenuItem onClick={() => changeStatus({ id: item.id, status: 'EN_MANTENIMIENTO' })}>
                                                <Wrench className="mr-2 h-4 w-4 text-amber-500" /> Enviar a Mantenimiento
                                            </DropdownMenuItem>
                                        )}
                                        {item.status !== 'DE_BAJA' && (
                                            <DropdownMenuItem onClick={() => changeStatus({ id: item.id, status: 'DE_BAJA' })}>
                                                <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" /> Dar de Baja
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem 
                                            onClick={() => {
                                                if(confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
                                                    deleteMachinery(item.id);
                                                }
                                            }}
                                            className="text-destructive focus:text-destructive mt-2 border-t"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
