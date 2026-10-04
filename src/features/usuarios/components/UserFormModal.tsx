import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userCreateSchema, userUpdateSchema } from '../schemas';
import { useCreateUser, useUpdateUser } from '../api';
import { useRoles } from '../api/roles';
import type { UserResponseDTO } from '../types';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    userToEdit?: UserResponseDTO | null;
    companyId?: string;
}



export const UserFormModal = ({ isOpen, onClose, userToEdit, companyId }: UserFormModalProps) => {
    const isEditing = !!userToEdit;
    const { data: rolesData } = useRoles();
    const ROLES = rolesData || [];

    const { mutate: createUser, isPending: isCreating } = useCreateUser();
    const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

    const form = useForm<any>({
        resolver: zodResolver(isEditing ? userUpdateSchema : userCreateSchema),
        defaultValues: {
            fullName: '',
            email: '',
            username: '',
            password: '',
            roleId: '',
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                form.reset({
                    fullName: userToEdit.fullName,
                    username: userToEdit.username || '',
                    roleId: userToEdit.roleId.toString(),
                });
            } else {
                form.reset({
                    fullName: '',
                    email: '',
                    username: '',
                    password: '',
                    roleId: '',
                });
            }
        }
    }, [isOpen, userToEdit, form]);

    const onSubmit = (values: any) => {
        if (isEditing) {
            updateUser(
                { id: userToEdit!.id, payload: { ...values, roleId: Number(values.roleId) } },
                { onSuccess: () => onClose() }
            );
        } else {
            const payload: any = { ...values, roleId: Number(values.roleId) };
            if (companyId) {
                payload.companyId = companyId;
            }
            createUser(
                payload,
                { onSuccess: () => onClose() }
            );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Modifica los datos del usuario.' : 'Crea un nuevo usuario para tu empresa.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Juan Pérez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        {!isEditing && (
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="correo@empresa.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de Usuario (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="jperez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!isEditing && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="roleId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rol</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un rol" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ROLES.map((role) => (
                                                <SelectItem key={role.id} value={role.id.toString()}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" disabled={isCreating || isUpdating}>
                                {isCreating || isUpdating ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
