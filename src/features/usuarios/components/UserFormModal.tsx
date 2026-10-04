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
import { useCompanies } from '@/features/empresas/api/empresas';
import { useAuthStore } from '@/app/store/useAuthStore';
import type { UserResponseDTO } from '../types';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    userToEdit?: UserResponseDTO | null;
    companyId?: string;
}

export const UserFormModal = ({ isOpen, onClose, userToEdit, companyId }: UserFormModalProps) => {
    const isEditing = !!userToEdit;
    const { user, hasRole } = useAuthStore();
    const isSuperAdmin = hasRole(['SUPERADMIN']);
    const { data: rolesData } = useRoles();
    const ROLES = rolesData || [];
    
    const { data: companiesData } = useCompanies({ page: 0, size: 100 }, isSuperAdmin);
    const COMPANIES = companiesData?.content || [];

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
            companyId: '',
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                form.reset({
                    fullName: userToEdit.fullName,
                    username: userToEdit.username || '',
                    roleId: userToEdit.roleId.toString(),
                    companyId: userToEdit.companyId || '',
                });
            } else {
                form.reset({
                    fullName: '',
                    email: '',
                    username: '',
                    password: '',
                    roleId: '',
                    companyId: '',
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
            if (!isSuperAdmin && companyId) {
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
                        {isSuperAdmin && (
                            <FormField
                                control={form.control}
                                name="companyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Empresa (Inquilino)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione una empresa" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {COMPANIES.map((company: any) => (
                                                    <SelectItem key={company.id} value={company.id}>
                                                        {company.businessName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

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

                        <div className="grid grid-cols-2 gap-4">
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
                                    <FormItem className={isEditing ? "col-span-2" : ""}>
                                        <FormLabel>Usuario (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. jperez" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {!isEditing && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
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
                                    <FormLabel>Rol en el Sistema</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un rol" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ROLES.map((role: any) => (
                                                <SelectItem key={role.id} value={role.id.toString()}>
                                                    {role.name.replace('ROLE_', '')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isCreating || isUpdating}>
                                {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
