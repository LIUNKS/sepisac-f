import { useForm, useWatch } from 'react-hook-form';
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
import { machinerySchema, type MachineryFormValues } from '../schemas';
import { useCreateMachinery, useUpdateMachinery } from '../api';
import { useEffect } from 'react';
import type { MachineryResponseDTO } from '../types';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCompanies } from '@/features/empresas/api';

interface MachineryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    machineryToEdit?: MachineryResponseDTO | null;
}

export const MachineryFormModal = ({ isOpen, onClose, machineryToEdit }: MachineryFormModalProps) => {
    const isEditing = !!machineryToEdit;
    const { mutate: createMachinery, isPending: isCreating } = useCreateMachinery();
    const { mutate: updateMachinery, isPending: isUpdating } = useUpdateMachinery();
    const isPending = isCreating || isUpdating;

    const user = useAuthStore((state) => state.user);
    const hasRole = useAuthStore((state) => state.hasRole);
    const isSuperAdmin = hasRole(['SUPERADMIN']);

    const form = useForm<MachineryFormValues>({
        resolver: zodResolver(machinerySchema),
        defaultValues: {
            code: '',
            name: '',
            status: 'DISPONIBLE',
            lastMaintenanceDate: '',
            nextMaintenanceDate: '',
            companyId: '',
        },
    });

    const watchedCompanyId = useWatch({ control: form.control, name: 'companyId' });

    const { data: companiesData, isLoading: isLoadingCompanies } = useCompanies(
        { page: 0, size: 100, search: '', sort: 'businessName,asc' },
        isSuperAdmin && !isEditing
    );
    const companiesList = companiesData?.content || [];

    useEffect(() => {
        if (isOpen) {
            if (machineryToEdit) {
                form.reset({
                    code: machineryToEdit.code,
                    name: machineryToEdit.name,
                    status: machineryToEdit.status as 'DISPONIBLE' | 'EN_USO' | 'EN_MANTENIMIENTO' | 'DE_BAJA',
                    lastMaintenanceDate: machineryToEdit.lastMaintenanceDate || '',
                    nextMaintenanceDate: machineryToEdit.nextMaintenanceDate || '',
                    companyId: machineryToEdit.companyId,
                });
            } else {
                form.reset({
                    code: '',
                    name: '',
                    status: 'DISPONIBLE',
                    lastMaintenanceDate: '',
                    nextMaintenanceDate: '',
                    companyId: '',
                });
            }
        }
    }, [isOpen, machineryToEdit, form]);

    const onSubmit = (data: MachineryFormValues) => {
        const payload = {
            ...data,
            lastMaintenanceDate: data.lastMaintenanceDate || undefined,
            nextMaintenanceDate: data.nextMaintenanceDate || undefined,
        };

        if (isEditing) {
            updateMachinery(
                { id: machineryToEdit.id, payload },
                { onSuccess: () => onClose() }
            );
        } else {
            const targetCompanyId = isSuperAdmin ? data.companyId : user?.companyId;
            createMachinery(
                { ...payload, companyId: targetCompanyId },
                { onSuccess: () => onClose() }
            );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Maquinaria' : 'Nueva Maquinaria'}</DialogTitle>
                    <DialogDescription>
                        Ingrese los datos del equipo o maquinaria.
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: MQ-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado Operativo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                                                <SelectItem value="EN_USO">En Uso</SelectItem>
                                                <SelectItem value="EN_MANTENIMIENTO">Mantenimiento</SelectItem>
                                                <SelectItem value="DE_BAJA">De Baja</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre / Descripción</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Excavadora CAT 320" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="lastMaintenanceDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Último Mantenimiento</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="nextMaintenanceDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Próximo Mantenimiento</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending || (!isEditing && isSuperAdmin && !watchedCompanyId)}>
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
