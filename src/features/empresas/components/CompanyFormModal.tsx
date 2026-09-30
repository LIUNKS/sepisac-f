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
import { companyCreateSchema, type CompanyFormValues } from '../schemas';
import { useCreateCompany } from '../api';
import { useEffect } from 'react';

interface CompanyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CompanyFormModal = ({ isOpen, onClose }: CompanyFormModalProps) => {
    const { mutate: createCompany, isPending } = useCreateCompany();

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companyCreateSchema),
        defaultValues: {
            businessName: '',
            ruc: '',
            subscriptionStatus: 'ACTIVE',
        },
    });

    // Reseteamos el formulario cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            form.reset();
        }
    }, [isOpen, form]);

    const onSubmit = (data: CompanyFormValues) => {
        createCompany(data, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Agregar Empresa</DialogTitle>
                    <DialogDescription>
                        Complete los datos para registrar una nueva empresa (Tenant).
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="ruc"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>RUC</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: 20123456789" maxLength={11} {...field} />
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
                                    <FormLabel>Razón Social</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Mi Empresa S.A.C." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="subscriptionStatus"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado de Suscripción</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Activo</SelectItem>
                                            <SelectItem value="TRIAL">Prueba</SelectItem>
                                            <SelectItem value="SUSPENDED">Suspendido</SelectItem>
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
                            <Button type="submit" disabled={isPending}>
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
