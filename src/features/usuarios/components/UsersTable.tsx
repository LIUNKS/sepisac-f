import { useState } from 'react';
import type { UserResponseDTO } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Power, PowerOff, Users as UsersIcon, AlertTriangle, Loader2 } from 'lucide-react';
import { useToggleUserStatus } from '../api';

interface UsersTableProps {
    users: UserResponseDTO[];
    isLoading: boolean;
    onEdit: (user: UserResponseDTO) => void;
}

export const UsersTable = ({ users, isLoading, onEdit }: UsersTableProps) => {
    const { mutate: toggleStatus, isPending: isToggling } = useToggleUserStatus();
    const [userToToggle, setUserToToggle] = useState<UserResponseDTO | null>(null);

    const handleConfirmToggle = () => {
        if (!userToToggle) return;
        toggleStatus(userToToggle.id, {
            onSettled: () => setUserToToggle(null)
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <span className="text-muted-foreground animate-pulse text-sm">Cargando cuentas de usuario...</span>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-48 p-6 text-center">
                <UsersIcon className="w-10 h-10 text-muted-foreground opacity-30 mb-2" />
                <span className="text-foreground font-medium">No se encontraron usuarios</span>
                <span className="text-xs text-muted-foreground mt-1">Intenta con otro término de búsqueda o registra un nuevo usuario.</span>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent bg-secondary/20">
                            <TableHead className="text-muted-foreground font-semibold px-6">Usuario</TableHead>
                            <TableHead className="text-muted-foreground font-semibold">Correo Electrónico</TableHead>
                            <TableHead className="text-muted-foreground font-semibold">Rol Asignado</TableHead>
                            <TableHead className="text-muted-foreground font-semibold text-center">Estado</TableHead>
                            <TableHead className="text-muted-foreground font-semibold text-right px-6">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="border-border/50 hover:bg-muted/50">
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 border border-border/50">
                                            {user.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'US'}
                                        </div>
                                        <div>
                                            <div className={`font-semibold ${!user.isActive ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                {user.fullName}
                                            </div>
                                            {user.username && <div className="text-xs text-muted-foreground mt-0.5">@{user.username}</div>}
                                            {user.companyName && <div className="text-[10px] text-muted-foreground/75">{user.companyName}</div>}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-semibold text-xs border-primary/20 text-primary bg-primary/5">
                                        {user.roleName?.replace('ROLE_', '')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge 
                                        variant="outline" 
                                        className={`gap-1.5 font-medium text-xs ${
                                            user.isActive 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                                : 'bg-red-50 text-red-700 border-red-500/20 dark:bg-red-500/10 dark:text-red-400'
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
                                        <DropdownMenuContent align="end" className="w-44">
                                            <DropdownMenuItem onClick={() => onEdit(user)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Editar Usuario
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => setUserToToggle(user)}
                                                className={user.isActive ? 'text-destructive focus:text-destructive' : 'text-emerald-600 focus:text-emerald-600'}
                                            >
                                                {user.isActive ? (
                                                    <>
                                                        <PowerOff className="mr-2 h-4 w-4 text-destructive" />
                                                        <span>Desactivar</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Power className="mr-2 h-4 w-4 text-emerald-500" />
                                                        <span>Activar</span>
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Custom Shadcn Dialog Confirmation for Toggle User Status */}
            <Dialog open={!!userToToggle} onOpenChange={(open) => !open && setUserToToggle(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 text-destructive mb-2">
                            <div className={`p-2.5 rounded-full ${userToToggle?.isActive ? 'bg-destructive/10 text-destructive' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'}`}>
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <DialogTitle className={userToToggle?.isActive ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}>
                                {userToToggle?.isActive ? 'Desactivar Usuario' : 'Activar Usuario'}
                            </DialogTitle>
                        </div>
                        <DialogDescription>
                            {userToToggle?.isActive ? (
                                <>
                                    ¿Estás seguro de que deseas desactivar a{' '}
                                    <span className="font-semibold text-foreground">{userToToggle?.fullName}</span>?
                                    El usuario no podrá iniciar sesión en el sistema hasta que sea reactivado.
                                </>
                            ) : (
                                <>
                                    ¿Deseas activar nuevamente la cuenta de{' '}
                                    <span className="font-semibold text-foreground">{userToToggle?.fullName}</span>?
                                    Podrá ingresar normalmente a la plataforma con sus credenciales.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setUserToToggle(null)}
                            disabled={isToggling}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant={userToToggle?.isActive ? 'destructive' : 'default'}
                            onClick={handleConfirmToggle}
                            disabled={isToggling}
                        >
                            {isToggling ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                userToToggle?.isActive ? 'Sí, desactivar' : 'Sí, activar'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
