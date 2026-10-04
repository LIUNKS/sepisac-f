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
import { MoreHorizontal, FileText, User } from 'lucide-react';
import type { AuditLogResponseDTO } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditLogsTableProps {
    logs: AuditLogResponseDTO[];
    isLoading: boolean;
    onViewDetails: (log: AuditLogResponseDTO) => void;
}

export const AuditLogsTable = ({ logs, isLoading, onViewDetails }: AuditLogsTableProps) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48 border rounded-md bg-card">
                <span className="text-muted-foreground animate-pulse">Cargando registros...</span>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex justify-center items-center h-48 border rounded-md bg-card">
                <span className="text-muted-foreground">No se encontraron registros de auditoría.</span>
            </div>
        );
    }

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'CREATE':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">Creación</Badge>;
            case 'UPDATE':
                return <Badge className="bg-blue-500 hover:bg-blue-600">Modificación</Badge>;
            case 'DELETE':
                return <Badge variant="destructive">Eliminación</Badge>;
            case 'APPROVE':
                return <Badge className="bg-purple-500 hover:bg-purple-600">Aprobación</Badge>;
            case 'REJECT':
                return <Badge className="bg-orange-500 hover:bg-orange-600">Rechazo</Badge>;
            default:
                return <Badge variant="outline">{action}</Badge>;
        }
    };

    const getModuleBadge = (module: string) => {
        return <Badge variant="secondary" className="font-medium text-xs">{module}</Badge>;
    };

    return (
        <div className="rounded-md border bg-card overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="w-[180px]">FECHA</TableHead>
                            <TableHead>USUARIO</TableHead>
                            <TableHead>ACCIÓN</TableHead>
                            <TableHead>MÓDULO</TableHead>
                            <TableHead>DESCRIPCIÓN</TableHead>
                            <TableHead className="text-right">DETALLES</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                    {format(new Date(log.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="w-3 h-3 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{log.user?.fullName}</span>
                                            <span className="text-xs text-muted-foreground">{log.user?.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{getActionBadge(log.action)}</TableCell>
                                <TableCell>{getModuleBadge(log.moduleAffected)}</TableCell>
                                <TableCell className="max-w-[200px] truncate" title={log.description}>
                                    {log.description}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onViewDetails(log)}>
                                                <FileText className="mr-2 h-4 w-4 text-blue-500" />
                                                Ver Cambios (JSON)
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
