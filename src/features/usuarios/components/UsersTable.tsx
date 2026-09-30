import type { UserResponseDTO } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Power, PowerOff } from 'lucide-react';
import { useToggleUserStatus } from '../api';

interface UsersTableProps {
    users: UserResponseDTO[];
    isLoading: boolean;
    onEdit: (user: UserResponseDTO) => void;
}

export const UsersTable = ({ users, isLoading, onEdit }: UsersTableProps) => {
    const { mutate: toggleStatus } = useToggleUserStatus();

    if (isLoading) {
        return <div className="text-center py-8 text-muted-foreground">Cargando usuarios...</div>;
    }

    if (!users || users.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">No se encontraron usuarios.</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent bg-secondary/20">
                    <TableHead className="text-muted-foreground font-semibold px-6">Usuario</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Correo Electrónico</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Rol</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Estado</TableHead>
                    <TableHead className="text-muted-foreground font-semibold text-right px-6">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id} className="border-border/50 hover:bg-muted/50">
                        <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                                    {user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className={`font-semibold ${!user.isActive ? 'text-muted-foreground' : 'text-foreground'}`}>
                                        {user.fullName}
                                    </div>
                                    {user.username && <div className="text-xs text-muted-foreground mt-0.5">@{user.username}</div>}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                            <span className="font-medium text-sm text-foreground">{user.roleName}</span>
                        </TableCell>
                        <TableCell>
                            <Badge 
                                variant="secondary" 
                                className={`gap-1.5 ${
                                    user.isActive 
                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                        : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400'
                                }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                    user.isActive ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-red-600 dark:bg-red-400'
                                }`}></span>
                                {user.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </TableCell>
                        <TableCell className="px-6 text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Abrir menú</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(user)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => toggleStatus(user.id)}>
                                        {user.isActive ? (
                                            <><PowerOff className="mr-2 h-4 w-4 text-red-500" /> <span className="text-red-500">Desactivar</span></>
                                        ) : (
                                            <><Power className="mr-2 h-4 w-4 text-emerald-500" /> <span className="text-emerald-500">Activar</span></>
                                        )}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
