import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { createProject } from '@/features/projects/services/projectService';
import type { Quotation } from '../types';

const formSchema = z.object({
    code: z.string().min(1, 'El código es obligatorio').max(50),
    title: z.string().min(1, 'El título es obligatorio').max(150),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
    quotation: Quotation | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const CreateProjectFromQuotationModal = ({ quotation, isOpen, onClose, onSuccess }: Props) => {
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: quotation?.quotationNumber ? `PRJ-${quotation.quotationNumber.split('-')[1] || quotation.quotationNumber}` : '',
            title: quotation?.serviceType || '',
            description: `Proyecto generado a partir de la cotización ${quotation?.quotationNumber}`,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
        },
    });

    // Reset when quotation changes
    useState(() => {
        if (quotation) {
            form.reset({
                code: `PRJ-${quotation.quotationNumber.split('-')[1] || quotation.quotationNumber}`,
                title: quotation.serviceType,
                description: `Proyecto generado a partir de la cotización ${quotation.quotationNumber}`,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => createProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Proyecto creado exitosamente');
            if (onSuccess) onSuccess();
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al crear el proyecto');
        },
    });

    const onInvalid = (errors: any) => {
        console.error('Validation errors:', errors);
        const messages: string[] = [];
        Object.keys(errors).forEach(key => {
            if (errors[key]?.message) {
                messages.push(`- ${key}: ${errors[key].message}`);
            }
        });
        toast.error('Corrige los siguientes errores:', {
            description: messages.join(', ')
        });
    };

    const onSubmit = (data: FormValues) => {
        if (!quotation) return;
        
        createMutation.mutate({
            ...data,
            companyId: quotation.companyId,
            quotationId: quotation.id,
            clientName: quotation.clientName,
            status: 'PLANIFICACION',
        });
    };

    if (!quotation) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Convertir a Proyecto</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código del Proyecto</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha Inicio</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha Fin (Aprox)</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={createMutation.isPending}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Crear Proyecto
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
