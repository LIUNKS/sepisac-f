import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building2, FileText, Phone, Mail, Loader2 } from 'lucide-react';
import { useCreateSupplier, useUpdateSupplier } from '../hooks/useSuppliers';
import { useAuthStore } from '@/app/store/useAuthStore';
import type { Supplier } from '../types';

const supplierSchema = z.object({
    companyId: z.string().nullish(),
    businessName: z.string().min(2, 'La razón social es requerida'),
    ruc: z.string().length(11, 'El RUC debe tener 11 dígitos').regex(/^\d+$/, 'El RUC debe contener solo números'),
    contactPhone: z.string().optional(),
    email: z.string().email('Debe ser un correo válido').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof supplierSchema>;

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplierToEdit?: Supplier | null;
}

export const SupplierModal = ({ isOpen, onClose, supplierToEdit }: SupplierModalProps) => {
    const isEditing = !!supplierToEdit;
    const { user, hasRole } = useAuthStore();
    const isSuperAdmin = hasRole(['SUPERADMIN']);

    const createMutation = useCreateSupplier();
    const updateMutation = useUpdateSupplier();

    const form = useForm<FormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            companyId: user?.companyId,
            businessName: '',
            ruc: '',
            contactPhone: '',
            email: '',
        }
    });

    useEffect(() => {
        if (supplierToEdit && isOpen) {
            form.reset({
                companyId: supplierToEdit.companyId,
                businessName: supplierToEdit.businessName,
                ruc: supplierToEdit.ruc,
                contactPhone: supplierToEdit.contactPhone || '',
                email: supplierToEdit.email || '',
            });
        } else if (isOpen) {
            form.reset({
                companyId: isSuperAdmin ? undefined : user?.companyId,
                businessName: '',
                ruc: '',
                contactPhone: '',
                email: '',
            });
        }
    }, [supplierToEdit, isOpen, form, user, isSuperAdmin]);

    const onSubmit = (data: FormValues) => {
        if (isEditing && supplierToEdit) {
            updateMutation.mutate(
                { id: supplierToEdit.id, data },
                { onSuccess: () => onClose() }
            );
        } else {
            createMutation.mutate(data, { onSuccess: () => onClose() });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Building2 className="w-5 h-5 text-primary" />
                        {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        
                        {isSuperAdmin && (
                            <FormField
                                control={form.control}
                                name="companyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID de Empresa (Superadmin)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="UUID de la empresa" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="ruc"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> RUC
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="20000000001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="businessName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4" /> Razón Social
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nombre de la empresa proveedora" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="contactPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" /> Teléfono
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Opcional" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" /> Correo
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Opcional" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isEditing ? 'Guardar Cambios' : 'Registrar Proveedor'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
