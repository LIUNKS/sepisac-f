import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { employeeSchema, type EmployeeFormValues } from '../schemas';
import { useCreateEmployee, useUpdateEmployee } from '../api';
import { useEffect } from 'react';
import type { EmployeeResponseDTO } from '../types';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCompanies } from '@/features/empresas/api';
import { useUsers } from '@/features/usuarios/api';

interface EmployeeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    employeeToEdit?: EmployeeResponseDTO | null;
}

export const EmployeeFormModal = ({ isOpen, onClose, employeeToEdit }: EmployeeFormModalProps) => {
    const isEditing = !!employeeToEdit;
    const { mutate: createEmployee, isPending: isCreating } = useCreateEmployee();
    const { mutate: updateEmployee, isPending: isUpdating } = useUpdateEmployee();
    const isPending = isCreating || isUpdating;

    const user = useAuthStore((state) => state.user);
    const hasRole = useAuthStore((state) => state.hasRole);
    const isSuperAdmin = hasRole(['SUPERADMIN']);

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            fullName: '',
            specialty: '',
            contractType: 'PLANILLA',
            baseSalary: 0,
            currentHourlyCost: 0,
            companyId: '',
            userId: '',
        },
    });

    // Obtain the companyId to use for fetching users
    const selectedCompanyId = isSuperAdmin ? (isEditing ? employeeToEdit?.companyId : form.watch('companyId')) : user?.companyId;

    const { data: companiesData, isLoading: isLoadingCompanies } = useCompanies(
        { page: 0, size: 100, search: '', sort: 'businessName,asc' },
        isSuperAdmin && !isEditing
    );
    const companiesList = companiesData?.content || [];

    const { data: usersData, isLoading: isLoadingUsers } = useUsers(
        selectedCompanyId,
        { page: 0, size: 100, search: '', sort: 'fullName,asc' },
        !!selectedCompanyId
    );
    const usersList = usersData?.content || [];

    useEffect(() => {
        if (isOpen) {
            if (employeeToEdit) {
                form.reset({
                    fullName: employeeToEdit.fullName,
                    specialty: employeeToEdit.specialty,
                    contractType: employeeToEdit.contractType as 'PLANILLA' | 'LOCACION',
                    baseSalary: employeeToEdit.baseSalary,
                    currentHourlyCost: employeeToEdit.currentHourlyCost,
                    companyId: employeeToEdit.companyId,
                    userId: employeeToEdit.userId || '',
                });
            } else {
                form.reset({
                    fullName: '',
                    specialty: '',
                    contractType: 'PLANILLA',
                    baseSalary: 0,
                    currentHourlyCost: 0,
                    companyId: '',
                    userId: '',
                });
            }
        }
    }, [isOpen, employeeToEdit, form]);

    const onSubmit = (data: EmployeeFormValues) => {
        const payload = {
            ...data,
            userId: data.userId === 'none' || data.userId === '' ? undefined : data.userId
        };

        if (isEditing) {
            updateEmployee(
                { id: employeeToEdit.id, payload: payload },
                { onSuccess: () => onClose() }
            );
        } else {
            const targetCompanyId = isSuperAdmin ? data.companyId : user?.companyId;
            createEmployee(
                { ...payload, companyId: targetCompanyId },
                { onSuccess: () => onClose() }
            );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
                    <DialogDescription>
                        Ingrese los datos del trabajador.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        
                        {!isEditing && isSuperAdmin && (
                            <FormField
                                control={form.control}
                                name="companyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Empresa (Tenant)</FormLabel>
                                        <Select 
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                form.setValue('userId', ''); // Reset user when company changes
                                            }} 
                                            defaultValue={field.value || ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger disabled={isLoadingCompanies}>
                                                    <SelectValue placeholder="Seleccione una empresa" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {companiesList.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.businessName}
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
                            name="userId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vincular a Usuario (Opcional)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                                        <FormControl>
                                            <SelectTrigger disabled={!selectedCompanyId || isLoadingUsers}>
                                                <SelectValue placeholder="Seleccione un usuario" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">-- Sin vincular --</SelectItem>
                                            {usersList.map((u) => (
                                                <SelectItem key={u.id} value={u.id}>
                                                    {u.fullName} ({u.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Juan Pérez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="specialty"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Especialidad</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Electricista" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="baseSalary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sueldo Base</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="currentHourlyCost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Costo / Hora</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="contractType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Contrato</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione el tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="PLANILLA">Planilla</SelectItem>
                                            <SelectItem value="LOCACION">Locación</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending || (!isEditing && isSuperAdmin && !form.watch('companyId'))}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
