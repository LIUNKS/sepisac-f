import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

import type { Quotation } from '../types';
import { updateQuotation } from '../services/quotation.service';

const formSchema = z.object({
    clientName: z.string().min(1, 'El nombre del cliente es obligatorio').max(150, 'Máximo 150 caracteres'),
    serviceType: z.string().min(1, 'El tipo de servicio es obligatorio').max(50, 'Máximo 50 caracteres'),
    currency: z.enum(['PEN', 'USD'], {
        required_error: 'La moneda es obligatoria'
    }),
    exchangeRate: z.number().min(0, 'No puede ser negativo'),
    profitMarginPercentage: z.number().min(0, 'No puede ser negativo'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditQuotationModalProps {
    quotation: Quotation | null;
    isOpen: boolean;
    onClose: () => void;
}

export const EditQuotationModal = ({ quotation, isOpen, onClose }: EditQuotationModalProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clientName: '',
            serviceType: '',
            currency: 'PEN',
            exchangeRate: 1,
            profitMarginPercentage: 20,
        },
    });

    useEffect(() => {
        if (quotation && isOpen) {
            form.reset({
                clientName: quotation.clientName || '',
                serviceType: quotation.serviceType || '',
                currency: (quotation.currency as 'PEN' | 'USD') || 'PEN',
                exchangeRate: quotation.exchangeRate || 1,
                profitMarginPercentage: quotation.profitMarginPercentage || 20,
            });
        }
    }, [quotation, isOpen, form]);

    const updateMutation = useMutation({
        mutationFn: (data: FormValues) => {
            if (!quotation) throw new Error('No quotation selected');
            return updateQuotation(quotation.id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotations'] });
            toast({
                title: 'Cotización actualizada',
                description: 'Los datos se han guardado exitosamente.',
            });
            onClose();
        },
        onError: (error: any) => {
            toast({
                title: 'Error al actualizar',
                description: error.response?.data?.message || 'Ocurrió un error inesperado.',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: FormValues) => {
        updateMutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Cotización</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        
                        <FormField
                            control={form.control}
                            name="clientName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cliente Solicitante</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ej. Minera S.A." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="serviceType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Servicio / Referencia</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ej. Mantenimiento Preventivo" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Moneda</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PEN">Soles (PEN)</SelectItem>
                                                <SelectItem value="USD">Dólares (USD)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="exchangeRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Cambio</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                step="0.0001" 
                                                {...field} 
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="profitMarginPercentage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Margen de Ganancia (%)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            step="0.01" 
                                            {...field} 
                                            onChange={e => field.onChange(parseFloat(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
