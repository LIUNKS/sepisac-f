import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useRoles } from '../api/roles';

export const RolesTab = () => {
    const { data: roles, isLoading } = useRoles();

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent bg-secondary/20">
                        <TableHead className="w-20 px-6 font-semibold text-muted-foreground">ID</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Nombre del Rol</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Descripción de Autorización</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-32 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    <span className="text-xs text-muted-foreground">Cargando catálogo de roles...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : roles?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <ShieldCheck className="w-10 h-10 text-muted-foreground opacity-30" />
                                    <span className="text-foreground font-medium">No hay roles registrados</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        roles?.map((role) => (
                            <TableRow key={role.id} className="border-border/50 hover:bg-muted/50">
                                <TableCell className="px-6 py-4 font-mono font-medium text-foreground">
                                    #{role.id}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-semibold text-xs border-primary/20 text-primary bg-primary/5 gap-1.5 py-1 px-2.5">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        {role.name.replace('ROLE_', '')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {role.description || 'Sin descripción detallada'}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
