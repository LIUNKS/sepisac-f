import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, ShieldCheck } from 'lucide-react';
import { useRoles } from '../api/roles';
import { useAuthStore } from '@/app/store/useAuthStore';
import { RoleFormModal } from './RoleFormModal';

export const RolesTab = () => {
    const { data: roles, isLoading } = useRoles();
    const { hasRole } = useAuthStore();
    const isSuperAdmin = hasRole(['SUPERADMIN']);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border border-border/50">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Catálogo de Roles
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Administra los roles del sistema y sus descripciones.
                    </p>
                </div>
                {isSuperAdmin && (
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo Rol
                    </Button>
                )}
            </div>

            <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="w-16">ID</TableHead>
                            <TableHead>ROL</TableHead>
                            <TableHead>DESCRIPCIÓN</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : roles?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No hay roles registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            roles?.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">{role.id}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-semibold text-primary">
                                            {role.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {role.description || '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <RoleFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};
