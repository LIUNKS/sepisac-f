import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Loader2 } from 'lucide-react';
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

import { getProjectResourceRequirements, updateProject } from '../services/projectService';
import { formatProjectTitle } from '@/features/cotizaciones';
import type { Project } from '../types';

const projectUpdateSchema = z.object({
    title: z.string().min(1, 'El título es obligatorio').max(150, 'Máximo 150 caracteres'),
    clientName: z.string().min(1, 'El nombre del cliente es obligatorio').max(150, 'Máximo 150 caracteres'),
    description: z.string().optional(),
    status: z.enum(['PENDIENTE', 'EN_PROCESO', 'EN PROGRESO', 'COMPLETADO', 'CANCELADO']),
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
                title: formatProjectTitle(project.title),
                clientName: project.clientName,
                description: project.description || '',
                status: (project.status === 'EN PROGRESO' ? 'EN_PROCESO' : project.status) as any,
                startDate: project.startDate || '',
                endDate: project.endDate || '',
            });
        }
    }, [project, isOpen, form]);

    const { data: requirements } = useQuery({
        queryKey: ['project-resource-requirements', project?.id],
        queryFn: () => getProjectResourceRequirements(project!.id),
        enabled: isOpen && !!project?.id,
    });

    const normalizedCurrentStatus = (project?.status || '').trim().toUpperCase();
    const isAlreadyInProgress = normalizedCurrentStatus === 'EN_PROCESO' || normalizedCurrentStatus === 'EN PROGRESO';
    const blockedFromStart = !isAlreadyInProgress && !!requirements && !requirements.readyToStart;
    const selectedStatus = useWatch({ control: form.control, name: 'status' });

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
            queryClient.invalidateQueries({ queryKey: ['project-resource-requirements'] });
            toast.success('Proyecto actualizado exitosamente');
            onClose();
            form.reset();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al actualizar el proyecto');
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
                                                <SelectItem value="EN_PROCESO" disabled={blockedFromStart}>
                                                    {blockedFromStart
                                                        ? `En Proceso (Requiere Personal ${requirements.assignedEmployees}/${requirements.budgetedEmployees}, Maq. ${requirements.assignedMachinery}/${requirements.budgetedMachinery})`
                                                        : 'En Proceso'}
                                                </SelectItem>
                                                <SelectItem value="COMPLETADO">Completado</SelectItem>
                                                <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {blockedFromStart && (
                                            <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                                <span>
                                                    Para iniciar ejecución asigna el presupuesto completo: Personal {requirements.assignedEmployees}/{requirements.budgetedEmployees}, Maquinaria {requirements.assignedMachinery}/{requirements.budgetedMachinery}.
                                                </span>
                                            </p>
                                        )}
                                        {blockedFromStart && selectedStatus === 'EN_PROCESO' && (
                                            <p className="text-[11px] text-destructive font-medium">
                                                No es posible guardar el cambio a En Proceso mientras falten recursos presupuestados.
                                            </p>
                                        )}
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

