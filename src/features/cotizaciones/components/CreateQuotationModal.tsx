import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Loader2, Plus, Trash2 } from 'lucide-react';
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
import { useAuthStore } from '@/app/store/useAuthStore';
import { createQuotation } from '../services/quotation.service';
import { getInventory } from '@/features/inventario/services/inventory.service';
import { useEmployees } from '@/features/empleados/api/empleados';

const detailSchema = z.object({
    itemDescription: z.string().min(1, 'La descripción es obligatoria').max(255),
    itemType: z.string().min(1, 'El tipo es obligatorio').max(30),
    quantity: z.number().min(1, 'Mínimo 1'),
    unitPrice: z.number().min(0, 'Mínimo 0'),
});

const laborSchema = z.object({
    specialtyNeeded: z.string().min(1, 'La especialidad es obligatoria').max(100),
    quantityRequired: z.number().min(1, 'Mínimo 1'),
    estimatedHours: z.number().min(1, 'Mínimo 1'),
    lockedHourlyCost: z.number().min(0, 'Mínimo 0'),
});

const formSchema = z.object({
    quotationNumber: z.string().min(1, 'El número de cotización es obligatorio').max(50),
    clientName: z.string().min(1, 'El nombre del cliente es obligatorio').max(150),
    serviceType: z.string().min(1, 'El tipo de servicio es obligatorio').max(50),
    currency: z.enum(['PEN', 'USD']),
    exchangeRate: z.number().min(0),
    profitMarginPercentage: z.number().min(0),
    companyId: z.string().nullish(),
    details: z.array(detailSchema),
    laborRequirements: z.array(laborSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateQuotationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateQuotationModal = ({ isOpen, onClose }: CreateQuotationModalProps) => {
    const queryClient = useQueryClient();
    const { user, hasRole } = useAuthStore();
    const isSuperAdmin = hasRole(['SUPERADMIN']);

    const { data: inventoryData } = useQuery({
        queryKey: ['inventory', user?.companyId],
        queryFn: () => getInventory(user?.companyId, 0, 100, '%'),
    });

    const { data: employeesData } = useEmployees(user?.companyId, { page: 0, size: 100 });

    const inventoryItems = inventoryData?.content || [];
    const employeesList = employeesData?.content || [];

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quotationNumber: '',
            clientName: '',
            serviceType: '',
            currency: 'PEN',
            exchangeRate: 1,
            profitMarginPercentage: 20,
            companyId: user?.companyId || undefined,
            details: [],
            laborRequirements: [],
        },
    });

    const { fields: detailFields, append: appendDetail, remove: removeDetail } = useFieldArray({
        control: form.control,
        name: 'details',
    });

    const { fields: laborFields, append: appendLabor, remove: removeLabor } = useFieldArray({
        control: form.control,
        name: 'laborRequirements',
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                quotationNumber: `COT-${new Date().getTime().toString().slice(-6)}`,
                clientName: '',
                serviceType: '',
                currency: 'PEN',
                exchangeRate: 1,
                profitMarginPercentage: 20,
                companyId: isSuperAdmin ? undefined : user?.companyId,
                details: [],
                laborRequirements: [],
            });
        }
    }, [isOpen, form, user, isSuperAdmin]);

    const createMutation = useMutation({
        mutationFn: (data: FormValues) => createQuotation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotations'] });
            toast.success('Cotización creada exitosamente');
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al crear la cotización');
        },
    });

    const onInvalid = (errors: any) => {
        console.error('Validation errors:', errors);
        const messages: string[] = [];
        
        Object.keys(errors).forEach(key => {
            if (errors[key]?.message) {
                let msg = errors[key].message as string;
                if (msg.includes('Expected string, received null')) msg = 'Campo vacío o inválido';
                messages.push(`- ${key}: ${msg}`);
            } else if (Array.isArray(errors[key])) {
                messages.push(`- ${key}: Por favor complete todos los datos de las filas.`);
            }
        });
        
        toast.error('Corrige los siguientes errores:', {
            description: messages.join(', ')
        });
    };

    const onSubmit = (data: FormValues) => {
        if (isSuperAdmin && !data.companyId) {
            toast.error('Debe proporcionar un ID de empresa al crear como Superadmin');
            return;
        }
        createMutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nueva Cotización</DialogTitle>
                </DialogHeader>

                <datalist id="inventory-list">
                    {inventoryItems.map(item => <option key={item.id} value={item.name} />)}
                </datalist>
                <datalist id="employees-list">
                    {Array.from(new Set(employeesList.map(emp => emp.specialty))).map(spec => {
                        const emp = employeesList.find(e => e.specialty === spec);
                        return emp ? <option key={emp.id} value={emp.specialty} /> : null;
                    })}
                </datalist>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isSuperAdmin && (
                                <FormField
                                    control={form.control}
                                    name="companyId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ID de Empresa (Superadmin)</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="UUID de la empresa" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="quotationNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nº Cotización</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="COT-001" />
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
                                    <FormItem className="col-span-1 md:col-span-2">
                                        <FormLabel>Tipo de Servicio / Referencia</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ej. Mantenimiento Preventivo" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                            <Input type="number" step="0.001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="profitMarginPercentage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Margen de Ganancia (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Detalles / Materiales */}
                        <div className="space-y-4 border p-4 rounded-lg bg-card">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Materiales / Insumos</h3>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendDetail({ itemDescription: '', itemType: 'MATERIAL', quantity: 1, unitPrice: 0 })}>
                                    <Plus className="w-4 h-4 mr-2" /> Agregar Ítem
                                </Button>
                            </div>
                            {detailFields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-muted/30 p-3 rounded-md">
                                    <FormField
                                        control={form.control}
                                        name={`details.${index}.itemDescription`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-1 md:col-span-5">
                                                <FormLabel>Descripción</FormLabel>
                                                <FormControl>
                                                    <Input list="inventory-list" {...field} onChange={e => {
                                                        field.onChange(e);
                                                        const selected = inventoryItems.find(item => item.name === e.target.value);
                                                        if (selected) {
                                                            form.setValue(`details.${index}.unitPrice` as any, selected.salePrice || selected.purchaseCost);
                                                            form.setValue(`details.${index}.itemType` as any, 'MATERIAL');
                                                        }
                                                    }} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`details.${index}.itemType`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-1 md:col-span-3">
                                                <FormLabel>Tipo</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="MATERIAL">Material</SelectItem>
                                                        <SelectItem value="EQUIPO">Equipo</SelectItem>
                                                        <SelectItem value="HERRAMIENTA">Herramienta</SelectItem>
                                                        <SelectItem value="OTRO">Otro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`details.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-1 md:col-span-1">
                                                <FormLabel>Cant.</FormLabel>
                                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`details.${index}.unitPrice`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-1 md:col-span-2">
                                                <FormLabel>P. Unit</FormLabel>
                                                <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="col-span-1 md:col-span-1 flex justify-center pb-2">
                                        <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeDetail(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {detailFields.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-2">No se han agregado insumos.</p>}
                        </div>

                        {/* Requerimientos Laborales */}
                        <div className="space-y-4 border p-4 rounded-lg bg-card">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Requerimientos Laborales</h3>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendLabor({ specialtyNeeded: '', quantityRequired: 1, estimatedHours: 8, lockedHourlyCost: 0 })}>
                                    <Plus className="w-4 h-4 mr-2" /> Agregar Personal
                                </Button>
                            </div>
                            {laborFields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-muted/30 p-3 rounded-md">
                                    <FormField
                                        control={form.control}
                                        name={`laborRequirements.${index}.specialtyNeeded`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-1 md:col-span-5">
                                                <FormLabel>Especialidad</FormLabel>
                                                <FormControl>
                                                    <Input list="employees-list" {...field} placeholder="Ej. Soldador Homologado" onChange={e => {
                                                        field.onChange(e);
                                                        const selected = employeesList.find(emp => emp.specialty === e.target.value);
                                                        if (selected) {
                                                            form.setValue(`laborRequirements.${index}.lockedHourlyCost` as any, selected.currentHourlyCost);
                                                        }
                                                    }} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`laborRequirements.${index}.quantityRequired`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-1 md:col-span-2">
                                                <FormLabel>Personal</FormLabel>
                                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`laborRequirements.${index}.estimatedHours`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-1 md:col-span-2">
                                                <FormLabel>Horas Est.</FormLabel>
                                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`laborRequirements.${index}.lockedHourlyCost`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-1 md:col-span-2">
                                                <FormLabel>Costo / Hora</FormLabel>
                                                <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="col-span-1 md:col-span-1 flex justify-center pb-2">
                                        <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeLabor(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {laborFields.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-2">No se ha agregado personal.</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose} disabled={createMutation.isPending}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Crear Cotización
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
