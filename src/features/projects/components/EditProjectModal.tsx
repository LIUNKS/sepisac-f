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
import { Textarea } from '@/components/ui/textarea';

import { updateProject } from '../services/projectService';
import type { Project } from '../types';

const projectUpdateSchema = z.object({
    title: z.string().min(1, 'El título es obligatorio').max(150, 'Máximo 150 caracteres'),
    clientName: z.string().min(1, 'El nombre del cliente es obligatorio').max(150, 'Máximo 150 caracteres'),
    description: z.string().optional(),
    status: z.enum(['PENDIENTE', 'EN PROGRESO', 'COMPLETADO']),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
});

type ProjectUpdateValues = z.infer<typeof projectUpdateSchema>;

interface EditProjectModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

export const EditProjectModal = ({ project, isOpen, onClose }: EditProjectModalProps) => {
    const queryClient = useQueryClient();

    const form = useForm<ProjectUpdateValues>({
        resolver: zodResolver(projectUpdateSchema),
        defaultValues: {
            title: '',
            clientName: '',
            description: '',
            status: 'PENDIENTE',
            startDate: '',
            endDate: '',
        },
    });

    useEffect(() => {
        if (project && isOpen) {
            form.reset({
                title: project.title,
                clientName: project.clientName,
                description: project.description || '',
                status: project.status as any,
                startDate: project.startDate || '',
                endDate: project.endDate || '',
            });
        }
    }, [project, isOpen, form]);

    const mutation = useMutation({
        mutationFn: async (data: ProjectUpdateValues) => {
            if (!project) throw new Error('No hay proyecto seleccionado');
            return updateProject(project.id, {
                title: data.title,
                clientName: data.clientName,
                description: data.description,
                status: data.status,
                startDate: data.startDate || null,
                endDate: data.endDate || null,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            onClose();
            form.reset();
        },
    });

    const onSubmit = (data: ProjectUpdateValues) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl bg-card border-border shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground">
                        Editar Proyecto
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Título del Proyecto</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="clientName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                                                <SelectItem value="EN PROGRESO">En Progreso</SelectItem>
                                                <SelectItem value="COMPLETADO">Completado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Inicio</FormLabel>
                                        <FormControl>
                                            <Input type="date" value={field.value || ''} onChange={field.onChange} />
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
                                        <FormLabel>Fecha de Fin</FormLabel>
                                        <FormControl>
                                            <Input type="date" value={field.value || ''} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} className="resize-none" rows={4} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
