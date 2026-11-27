import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { AlertTriangle, Loader2, Plus, Trash2 } from 'lucide-react';
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
import {
    SearchableCombobox,
    type ComboboxFilterTab,
    type ComboboxOption,
} from '@/components/common/SearchableCombobox';
import { useAuthStore } from '@/app/store/useAuthStore';
import { createQuotation } from '../services/quotation.service';
import { SERVICE_TYPE_OPTIONS } from '../utils/formatServiceType';
import {
    getInventory,
    getInventoryCategoryLabel,
    type InventoryItem,
} from '@/features/inventario';
import { employeeKeys, getEmployees } from '@/features/empleados';
import { getMachinery, machineryKeys } from '@/features/maquinaria';
import { useCompanies } from '@/features/empresas';

const DETAIL_ITEM_TYPES = [
    { value: 'MATERIAL', label: 'Material / Consumible' },
    { value: 'REPUESTO', label: 'Repuesto Mecánico' },
    { value: 'HERRAMIENTA', label: 'Herramienta' },
    { value: 'EQUIPO', label: 'Equipo / Maquinaria' },
    { value: 'TRANSPORTE', label: 'Transporte / Flete' },
    { value: 'VIATICOS', label: 'Viáticos / Estadía' },
    { value: 'OTROS', label: 'Otros Gastos' },
] as const;

const MATERIAL_SUBFILTER_TABS: ComboboxFilterTab[] = [
    { value: 'ALL', label: 'Todos' },
    { value: 'CONSUMIBLES_SOLDADURA', label: 'Consumibles' },
    { value: 'LUBRICANTES_FLUIDOS', label: 'Lubricantes' },
    { value: 'SEGURIDAD_EPP', label: 'EPP' },
    { value: 'OTROS', label: 'Otros' },
];

const FREE_TEXT_PLACEHOLDERS: Record<string, string> = {
    TRANSPORTE: 'Ej. Flete de carga pesada Lima - Mina',
    VIATICOS: 'Ej. Viáticos y estadía técnica en campamento (5 días)',
    OTROS: 'Ej. Servicio de calibración / ensayo no destructivo',
};

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

const mapInventoryItemToOption = (item: InventoryItem): ComboboxOption => {
    const categoryLabel = item.categoryLabel || getInventoryCategoryLabel(item.category);
    const catalogPrice = item.salePrice || item.purchaseCost || 0;
    return {
        value: item.name,
        label: item.name,
        subtitle: `SKU: ${item.sku} • ${categoryLabel}`,
        meta: `S/ ${catalogPrice.toFixed(2)}`,
        badge: `Stock: ${item.stockQuantity} ${item.unit || 'und'}`,
        badgeVariant: item.stockQuantity <= 0 ? 'danger' : item.isLowStock ? 'warning' : 'success',
        group: categoryLabel,
        keywords: `${item.name} ${item.sku} ${item.description || ''} ${categoryLabel}`,
    };
};

export const CreateQuotationModal = ({ isOpen, onClose }: CreateQuotationModalProps) => {
    const queryClient = useQueryClient();
    const { user, hasRole } = useAuthStore();
    const isSuperAdmin = hasRole(['SUPERADMIN']);
    const [materialCategoryFilters, setMaterialCategoryFilters] = useState<Record<string, string>>({});

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

    const watchedCompanyId = useWatch({ control: form.control, name: 'companyId' });
    const watchedDetails = useWatch({ control: form.control, name: 'details' });
    const watchedLabor = useWatch({ control: form.control, name: 'laborRequirements' });
    const watchedCurrency = useWatch({ control: form.control, name: 'currency' }) || 'PEN';
    const watchedMargin = useWatch({ control: form.control, name: 'profitMarginPercentage' });

    const effectiveCompanyId = isSuperAdmin ? (watchedCompanyId || undefined) : user?.companyId;
    const catalogEnabled = isOpen && (!isSuperAdmin || Boolean(effectiveCompanyId));

    const { data: companiesPage } = useCompanies({ page: 0, size: 100 }, isSuperAdmin && isOpen);
    const companies = companiesPage?.content || [];

    const { data: inventoryData } = useQuery({
        queryKey: ['inventory', effectiveCompanyId, 'quotation-catalog'],
        queryFn: () => getInventory(effectiveCompanyId, 0, 200),
        enabled: catalogEnabled,
    });

    const { data: employeesData } = useQuery({
        queryKey: employeeKeys.list({ companyId: effectiveCompanyId, page: 0, size: 100 }),
        queryFn: () => getEmployees(effectiveCompanyId, { page: 0, size: 100 }),
        enabled: catalogEnabled,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const { data: machineryData } = useQuery({
        queryKey: machineryKeys.list({ companyId: effectiveCompanyId, page: 0, size: 100 }),
        queryFn: () => getMachinery(effectiveCompanyId, { page: 0, size: 100 }),
        enabled: catalogEnabled,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const inventoryItems = useMemo(() => inventoryData?.content || [], [inventoryData]);
    const employeesList = useMemo(() => employeesData?.content || [], [employeesData]);
    const machineryList = useMemo(() => machineryData?.content || [], [machineryData]);

    const machineryOptions = useMemo<ComboboxOption[]>(() => {
        return machineryList.map((machine) => ({
            value: `${machine.name} (${machine.code})`,
            label: machine.name,
            subtitle: `Código: ${machine.code}`,
            badge:
                machine.status === 'DISPONIBLE'
                    ? 'Disponible'
                    : machine.status === 'EN_USO'
                        ? 'En uso'
                        : machine.status === 'EN_MANTENIMIENTO'
                            ? 'En mantenimiento'
                            : machine.status,
            badgeVariant:
                machine.status === 'DISPONIBLE'
                    ? 'success'
                    : machine.status === 'EN_USO'
                        ? 'warning'
                        : 'danger',
            keywords: `${machine.name} ${machine.code} ${machine.status}`,
        }));
    }, [machineryList]);

    const specialtyCatalog = useMemo(() => {
        const grouped = new Map<string, { hourlyCosts: number[]; total: number; available: number; names: string[] }>();

        employeesList.forEach((emp) => {
            const specialty = emp.specialty?.trim();
            if (!specialty) return;

            const current = grouped.get(specialty) || {
                hourlyCosts: [],
                total: 0,
                available: 0,
                names: [],
            };
            current.total += 1;
            if (emp.isAvailable !== false) {
                current.available += 1;
            }
            if (Number.isFinite(emp.currentHourlyCost)) {
                current.hourlyCosts.push(emp.currentHourlyCost);
            }
            if (emp.fullName) {
                current.names.push(emp.fullName);
            }
            grouped.set(specialty, current);
        });

        const options: ComboboxOption[] = [];
        const costBySpecialty: Record<string, number> = {};

        grouped.forEach((stats, specialty) => {
            const avgCost =
                stats.hourlyCosts.length > 0
                    ? Number((stats.hourlyCosts.reduce((sum, val) => sum + val, 0) / stats.hourlyCosts.length).toFixed(2))
                    : 0;
            costBySpecialty[specialty] = avgCost;
            options.push({
                value: specialty,
                label: specialty,
                subtitle: `${stats.total} ${stats.total === 1 ? 'técnico registrado' : 'técnicos registrados'}`,
                meta: `S/ ${avgCost.toFixed(2)}/h`,
                badge: `${stats.available} disp.`,
                badgeVariant: stats.available > 0 ? 'success' : 'warning',
                keywords: `${specialty} ${stats.names.join(' ')}`,
            });
        });

        return { options, costBySpecialty };
    }, [employeesList]);

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
            setMaterialCategoryFilters({});
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

    const getOptionsForDetailRow = (itemType: string, rowKey: string): ComboboxOption[] => {
        if (itemType === 'EQUIPO') {
            return machineryOptions;
        }
        if (itemType === 'REPUESTO') {
            return inventoryItems
                .filter((item) => item.category === 'REPUESTOS_MECANICOS')
                .map(mapInventoryItemToOption);
        }
        if (itemType === 'HERRAMIENTA') {
            return inventoryItems
                .filter((item) => item.category === 'HERRAMIENTAS_EQUIPOS')
                .map(mapInventoryItemToOption);
        }
        if (itemType === 'MATERIAL') {
            const activeSubFilter = materialCategoryFilters[rowKey] || 'ALL';
            return inventoryItems
                .filter((item) => {
                    if (item.category === 'REPUESTOS_MECANICOS' || item.category === 'HERRAMIENTAS_EQUIPOS') {
                        return false;
                    }
                    if (activeSubFilter !== 'ALL') {
                        return item.category === activeSubFilter;
                    }
                    return true;
                })
                .map(mapInventoryItemToOption);
        }
        return [];
    };

    const itemsTotal = (watchedDetails || []).reduce(
        (sum, d) => sum + (Number(d?.quantity) || 0) * (Number(d?.unitPrice) || 0),
        0
    );
    const laborTotal = (watchedLabor || []).reduce(
        (sum, l) =>
            sum +
            (Number(l?.quantityRequired) || 0) *
                (Number(l?.estimatedHours) || 0) *
                (Number(l?.lockedHourlyCost) || 0),
        0
    );
    const directSubtotal = itemsTotal + laborTotal;
    const marginPct = Number.isFinite(Number(watchedMargin)) ? Number(watchedMargin) : 0;
    const estimatedTotal = directSubtotal * (1 + marginPct / 100);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto pb-8">
                <DialogHeader>
                    <DialogTitle>Nueva Cotización</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isSuperAdmin && (
                                <FormField
                                    control={form.control}
                                    name="companyId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Empresa (Superadmin)</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value || undefined}
                                                value={field.value || undefined}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione una empresa..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {companies.map((c) => (
                                                        <SelectItem key={c.id} value={c.id}>
                                                            {c.businessName} {c.ruc ? `(${c.ruc})` : ''}
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
                                        <FormLabel>Tipo de Servicio</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione un tipo de servicio..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {SERVICE_TYPE_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
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
                                                step="0.001"
                                                {...field}
                                                value={Number.isFinite(field.value) ? field.value : ''}
                                                onChange={e => {
                                                    const parsed = parseFloat(e.target.value);
                                                    field.onChange(Number.isNaN(parsed) ? 0 : parsed);
                                                }}
                                            />
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
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                value={Number.isFinite(field.value) ? field.value : ''}
                                                onChange={e => {
                                                    const parsed = parseFloat(e.target.value);
                                                    field.onChange(Number.isNaN(parsed) ? 0 : parsed);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Detalles / Materiales */}
                        <div className="space-y-4 border p-4 rounded-lg bg-card">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <h3 className="font-semibold text-lg">Materiales, Equipos y Gastos</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Elige primero el tipo para filtrar automáticamente el catálogo correspondiente.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        appendDetail({ itemDescription: '', itemType: 'MATERIAL', quantity: 1, unitPrice: 0 })
                                    }
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Agregar Ítem
                                </Button>
                            </div>

                            {detailFields.map((fieldItem, index) => {
                                const currentRow = watchedDetails?.[index];
                                const currentType = currentRow?.itemType || 'MATERIAL';
                                const currentDescription = currentRow?.itemDescription || '';
                                const currentQty = Number(currentRow?.quantity) || 0;
                                const currentPrice = Number(currentRow?.unitPrice) || 0;
                                const rowSubtotal = currentQty * currentPrice;
                                const isFreeTextType =
                                    currentType === 'TRANSPORTE' || currentType === 'VIATICOS' || currentType === 'OTROS';
                                const isInventoryBacked =
                                    currentType === 'MATERIAL' || currentType === 'REPUESTO' || currentType === 'HERRAMIENTA';
                                const matchedInventory = isInventoryBacked
                                    ? inventoryItems.find((inv) => inv.name === currentDescription)
                                    : undefined;
                                const rowOptions = getOptionsForDetailRow(currentType, fieldItem.id);
                                const activeMaterialSubfilter = materialCategoryFilters[fieldItem.id] || 'ALL';

                                return (
                                    <div key={fieldItem.id} className="space-y-2 bg-muted/30 p-3 rounded-md border border-border/50">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                            <FormField
                                                control={form.control}
                                                name={`details.${index}.itemType`}
                                                render={({ field }) => (
                                                    <FormItem className="col-span-1 md:col-span-3">
                                                        <FormLabel>Tipo</FormLabel>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={(newType) => {
                                                                field.onChange(newType);
                                                                form.setValue(`details.${index}.itemDescription`, '');
                                                                form.setValue(`details.${index}.unitPrice`, 0);
                                                                setMaterialCategoryFilters((prev) => ({
                                                                    ...prev,
                                                                    [fieldItem.id]: 'ALL',
                                                                }));
                                                            }}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {DETAIL_ITEM_TYPES.map((typeOpt) => (
                                                                    <SelectItem key={typeOpt.value} value={typeOpt.value}>
                                                                        {typeOpt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`details.${index}.itemDescription`}
                                                render={({ field }) => (
                                                    <FormItem className="col-span-1 md:col-span-5">
                                                        <FormLabel>
                                                            {currentType === 'EQUIPO'
                                                                ? 'Equipo / Maquinaria'
                                                                : isFreeTextType
                                                                    ? 'Descripción del Gasto'
                                                                    : 'Ítem del Catálogo / Descripción'}
                                                        </FormLabel>
                                                        <FormControl>
                                                            {isFreeTextType ? (
                                                                <Input
                                                                    {...field}
                                                                    placeholder={FREE_TEXT_PLACEHOLDERS[currentType] || 'Descripción...'}
                                                                />
                                                            ) : (
                                                                <SearchableCombobox
                                                                    value={field.value || ''}
                                                                    options={rowOptions}
                                                                    disabled={isSuperAdmin && !effectiveCompanyId}
                                                                    placeholder={
                                                                        isSuperAdmin && !effectiveCompanyId
                                                                            ? 'Seleccione primero una empresa...'
                                                                            : currentType === 'EQUIPO'
                                                                                ? 'Seleccionar equipo o maquinaria...'
                                                                                : currentType === 'REPUESTO'
                                                                                    ? 'Buscar repuesto mecánico...'
                                                                                    : currentType === 'HERRAMIENTA'
                                                                                        ? 'Buscar herramienta...'
                                                                                        : 'Buscar material / insumo...'
                                                                    }
                                                                    searchPlaceholder="Buscar por nombre, SKU o categoría..."
                                                                    emptyText="No hay ítems registrados para este tipo."
                                                                    filterTabs={currentType === 'MATERIAL' ? MATERIAL_SUBFILTER_TABS : undefined}
                                                                    activeFilterTab={activeMaterialSubfilter}
                                                                    onFilterTabChange={(val) =>
                                                                        setMaterialCategoryFilters((prev) => ({
                                                                            ...prev,
                                                                            [fieldItem.id]: val,
                                                                        }))
                                                                    }
                                                                    onSelect={(option) => {
                                                                        field.onChange(option.value);
                                                                        if (isInventoryBacked) {
                                                                            const selectedInv = inventoryItems.find(
                                                                                (item) => item.name === option.value
                                                                            );
                                                                            if (selectedInv) {
                                                                                form.setValue(
                                                                                    `details.${index}.unitPrice`,
                                                                                    selectedInv.salePrice || selectedInv.purchaseCost || 0
                                                                                );
                                                                            }
                                                                        }
                                                                    }}
                                                                    onCustomChange={(customVal) => {
                                                                        field.onChange(customVal);
                                                                    }}
                                                                />
                                                            )}
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`details.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem className="col-span-1 md:col-span-1">
                                                        <FormLabel>Cant.</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                {...field}
                                                                value={Number.isFinite(field.value) ? field.value : ''}
                                                                onChange={e => {
                                                                    const parsed = parseInt(e.target.value, 10);
                                                                    field.onChange(Number.isNaN(parsed) ? 0 : parsed);
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`details.${index}.unitPrice`}
                                                render={({ field }) => (
                                                    <FormItem className="col-span-1 md:col-span-2">
                                                        <FormLabel>P. Unit</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min={0}
                                                                {...field}
                                                                value={Number.isFinite(field.value) ? field.value : ''}
                                                                onChange={e => {
                                                                    const parsed = parseFloat(e.target.value);
                                                                    field.onChange(Number.isNaN(parsed) ? 0 : parsed);
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="col-span-1 md:col-span-1 flex justify-center pb-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500"
                                                    onClick={() => removeDetail(index)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] px-1">
                                            <div>
                                                {matchedInventory && currentQty > matchedInventory.stockQuantity && (
                                                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                        Stock actual: {matchedInventory.stockQuantity} {matchedInventory.unit || 'und'} (supera disponibilidad)
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-muted-foreground ml-auto">
                                                Subtotal ítem:{' '}
                                                <strong className="text-foreground">
                                                    {watchedCurrency} {rowSubtotal.toFixed(2)}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {detailFields.length === 0 && (
                                <p className="text-sm text-muted-foreground italic text-center py-2">
                                    No se han agregado insumos.
                                </p>
                            )}
                        </div>

                        {/* Requerimientos Laborales */}
                        <div className="space-y-4 border p-4 rounded-lg bg-card">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <h3 className="font-semibold text-lg">Requerimientos Laborales</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Selecciona una especialidad técnica para cargar su tarifa referencial por hora.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        appendLabor({
                                            specialtyNeeded: '',
                                            quantityRequired: 1,
                                            estimatedHours: 8,
                                            lockedHourlyCost: 0,
                                        })
                                    }
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Agregar Personal
                                </Button>
                            </div>

                            {laborFields.map((fieldItem, index) => {
                                const currentLabor = watchedLabor?.[index];
                                const laborSubtotal =
                                    (Number(currentLabor?.quantityRequired) || 0) *
                                    (Number(currentLabor?.estimatedHours) || 0) *
                                    (Number(currentLabor?.lockedHourlyCost) || 0);

                                return (
                                    <div key={fieldItem.id} className="space-y-2 bg-muted/30 p-3 rounded-md border border-border/50">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                            <FormField
                                                control={form.control}
                                                name={`laborRequirements.${index}.specialtyNeeded`}
                                                render={({ field }) => (
                                                    <FormItem className="col-span-1 md:col-span-5">
                                                        <FormLabel>Especialidad</FormLabel>
                                                        <FormControl>
                                                            <SearchableCombobox
                                                                value={field.value || ''}
                                                                options={specialtyCatalog.options}
                                                                disabled={isSuperAdmin && !effectiveCompanyId}
                                                                placeholder={
                                                                    isSuperAdmin && !effectiveCompanyId
                                                                        ? 'Seleccione primero una empresa...'
                                                                        : 'Seleccionar especialidad técnica...'
                                                                }
                                                                searchPlaceholder="Buscar especialidad o técnico..."
                                                                emptyText="No hay especialidades registradas en RRHH."
                                                                onSelect={(option) => {
                                                                    field.onChange(option.value);
                                                                    const cost = specialtyCatalog.costBySpecialty[option.value];
                                                                    if (cost !== undefined) {
                                                                        form.setValue(
                                                                            `laborRequirements.${index}.lockedHourlyCost`,
                                                                            cost
                                                                        );
                                                                    }
                                                                }}
                                                                onCustomChange={(customVal) => {
                                                                    field.onChange(customVal);
                                                                }}
                                                            />
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
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                {...field}
                                                                value={Number.isFinite(field.value) ? field.value : ''}
                                                                onChange={e => {
                                                                    const parsed = parseInt(e.target.value, 10);
                                                                    field.onChange(Number.isNaN(parsed) ? 0 : parsed);
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`laborRequirements.${index}.estimatedHours`}
                                                render={({ field }) => (
                                                    <FormItem className="col-span-1 md:col-span-2">
                                                        <FormLabel>Horas Est.</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                {...field}
                                                                value={Number.isFinite(field.value) ? field.value : ''}
                                                                onChange={e => {
                                                                    const parsed = parseInt(e.target.value, 10);
                                                                    field.onChange(Number.isNaN(parsed) ? 0 : parsed);
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`laborRequirements.${index}.lockedHourlyCost`}
                                                render={({ field }) => (
                                                    <FormItem className="col-span-1 md:col-span-2">
                                                        <FormLabel>Costo / Hora</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min={0}
                                                                {...field}
                                                                value={Number.isFinite(field.value) ? field.value : ''}
                                                                onChange={e => {
                                                                    const parsed = parseFloat(e.target.value);
                                                                    field.onChange(Number.isNaN(parsed) ? 0 : parsed);
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="col-span-1 md:col-span-1 flex justify-center pb-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500"
                                                    onClick={() => removeLabor(index)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex justify-end text-[11px] px-1 text-muted-foreground">
                                            Subtotal mano de obra:{' '}
                                            <strong className="text-foreground ml-1">
                                                {watchedCurrency} {laborSubtotal.toFixed(2)}
                                            </strong>
                                        </div>
                                    </div>
                                );
                            })}
                            {laborFields.length === 0 && (
                                <p className="text-sm text-muted-foreground italic text-center py-2">
                                    No se ha agregado personal.
                                </p>
                            )}
                        </div>

                        {/* Resumen Estimado en Vivo */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-lg border border-border bg-secondary/25 p-3 text-xs">
                            <div>
                                <span className="text-muted-foreground block">Materiales / Gastos</span>
                                <span className="font-semibold text-foreground">
                                    {watchedCurrency} {itemsTotal.toFixed(2)}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Mano de Obra</span>
                                <span className="font-semibold text-foreground">
                                    {watchedCurrency} {laborTotal.toFixed(2)}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Costo Directo Base</span>
                                <span className="font-semibold text-foreground">
                                    {watchedCurrency} {directSubtotal.toFixed(2)}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Total Estimado (+{marginPct}%)</span>
                                <span className="font-bold text-primary text-sm">
                                    {watchedCurrency} {estimatedTotal.toFixed(2)}
                                </span>
                            </div>
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
