import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Loader2, Users, Tractor, Package, Plus, Trash2, X, CheckCircle 
} from 'lucide-react';
import { toast } from 'sonner';

import { 
    getEmployeeAssignments, 
    getMachineryAssignments, 
    getInventoryConsumptions,
    assignEmployee,
    assignMachinery,
    consumeInventory,
    removeEmployeeAssignment,
    releaseMachineryAssignment
} from '../services/projectService';
import { getEmployees } from '@/features/empleados/api/empleados';
import { getMachinery } from '@/features/maquinaria/api/maquinaria';
import { getInventory } from '@/features/inventario/services/inventory.service';
import type { Project } from '../types';

interface ProjectExecutionModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ProjectExecutionModal = ({ project, isOpen, onClose }: ProjectExecutionModalProps) => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'personal' | 'maquinaria' | 'inventario'>('personal');

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    // Form Toggle States
    const [showAddEmployee, setShowAddEmployee] = useState(false);
    const [showAddMachinery, setShowAddMachinery] = useState(false);
    const [showAddInventory, setShowAddInventory] = useState(false);

    // Form Field States
    const [employeeForm, setEmployeeForm] = useState({
        employeeId: '',
        assignedRole: '',
        assignedDate: todayStr
    });

    const [machineryForm, setMachineryForm] = useState({
        machineryEquipmentId: '',
        assignedDate: todayStr,
        returnDate: ''
    });

    const [inventoryForm, setInventoryForm] = useState({
        inventoryItemId: '',
        quantity: 1,
        reason: ''
    });

    // 1. Project Assigned Data Queries
    const { data: employees = [], isLoading: loadingEmp } = useQuery({
        queryKey: ['project-employees', project?.id],
        queryFn: () => getEmployeeAssignments(project?.id as string),
        enabled: !!project && isOpen && activeTab === 'personal'
    });

    const { data: machinery = [], isLoading: loadingMach } = useQuery({
        queryKey: ['project-machinery', project?.id],
        queryFn: () => getMachineryAssignments(project?.id as string),
        enabled: !!project && isOpen && activeTab === 'maquinaria'
    });

    const { data: inventory = [], isLoading: loadingInv } = useQuery({
        queryKey: ['project-inventory', project?.id],
        queryFn: () => getInventoryConsumptions(project?.id as string),
        enabled: !!project && isOpen && activeTab === 'inventario'
    });

    // 2. Catalogs Data Queries (for selectors)
    const { data: availableEmployeesData, isLoading: loadingCatalogEmp } = useQuery({
        queryKey: ['catalog-employees', project?.companyId],
        queryFn: () => getEmployees(project?.companyId, { page: 0, size: 100 }),
        enabled: !!project && isOpen && showAddEmployee
    });

    const { data: availableMachineryData, isLoading: loadingCatalogMach } = useQuery({
        queryKey: ['catalog-machinery', project?.companyId],
        queryFn: () => getMachinery(project?.companyId, { page: 0, size: 100 }),
        enabled: !!project && isOpen && showAddMachinery
    });

    const { data: availableInventoryData, isLoading: loadingCatalogInv } = useQuery({
        queryKey: ['catalog-inventory', project?.companyId],
        queryFn: () => getInventory(project?.companyId, 0, 100),
        enabled: !!project && isOpen && showAddInventory
    });

    const catalogEmployees = availableEmployeesData?.content || [];
    const catalogMachinery = availableMachineryData?.content || [];
    const catalogInventory = availableInventoryData?.content || [];

    // Mutations
    const assignEmpMutation = useMutation({
        mutationFn: (data: { employeeId: string; assignedRole: string; assignedDate: string }) =>
            assignEmployee(project!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-employees', project?.id] });
            toast.success('Empleado asignado al proyecto exitosamente');
            setShowAddEmployee(false);
            setEmployeeForm({ employeeId: '', assignedRole: '', assignedDate: todayStr });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al asignar empleado');
        }
    });

    const removeEmpMutation = useMutation({
        mutationFn: (assignmentId: string) => removeEmployeeAssignment(project!.id, assignmentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-employees', project?.id] });
            toast.success('Empleado retirado del proyecto');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al retirar asignación');
        }
    });

    const assignMachMutation = useMutation({
        mutationFn: (data: { machineryEquipmentId: string; assignedDate: string; returnDate?: string }) =>
            assignMachinery(project!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-machinery', project?.id] });
            queryClient.invalidateQueries({ queryKey: ['catalog-machinery'] });
            toast.success('Maquinaria asignada al proyecto exitosamente');
            setShowAddMachinery(false);
            setMachineryForm({ machineryEquipmentId: '', assignedDate: todayStr, returnDate: '' });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al asignar maquinaria');
        }
    });

    const releaseMachMutation = useMutation({
        mutationFn: (assignmentId: string) => releaseMachineryAssignment(project!.id, assignmentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-machinery', project?.id] });
            queryClient.invalidateQueries({ queryKey: ['catalog-machinery'] });
            toast.success('Maquinaria liberada y retornada a almacén');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al liberar maquinaria');
        }
    });

    const consumeInvMutation = useMutation({
        mutationFn: (data: { inventoryItemId: string; quantity: number; reason?: string }) =>
            consumeInventory(project!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-inventory', project?.id] });
            queryClient.invalidateQueries({ queryKey: ['catalog-inventory'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Consumo de material registrado y stock descontado exitosamente');
            setShowAddInventory(false);
            setInventoryForm({ inventoryItemId: '', quantity: 1, reason: '' });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al registrar consumo de material');
        }
    });

    if (!project) return null;

    const selectedInventoryItem = catalogInventory.find(i => i.id === inventoryForm.inventoryItemId);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-card border-border shadow-2xl max-h-[90vh] flex flex-col p-6">
                <DialogHeader className="border-b border-border pb-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                                Gestión de Recursos: {project.title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-1">
                                Código de Proyecto: <span className="font-mono font-semibold text-foreground">{project.code}</span> • Cliente: <span className="font-semibold text-foreground">{project.clientName}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="mt-4 flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-3 mb-4 shrink-0">
                        <TabsTrigger value="personal" className="flex items-center gap-2 text-xs sm:text-sm">
                            <Users className="w-4 h-4 text-blue-500" /> 
                            Personal ({employees.length})
                        </TabsTrigger>
                        <TabsTrigger value="maquinaria" className="flex items-center gap-2 text-xs sm:text-sm">
                            <Tractor className="w-4 h-4 text-amber-500" /> 
                            Maquinaria ({machinery.length})
                        </TabsTrigger>
                        <TabsTrigger value="inventario" className="flex items-center gap-2 text-xs sm:text-sm">
                            <Package className="w-4 h-4 text-emerald-500" /> 
                            Inventario ({inventory.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* 1. PERSONAL TAB */}
                    <TabsContent value="personal" className="space-y-4 flex-1 overflow-y-auto pr-1">
                        <div className="flex justify-between items-center bg-secondary/30 p-3 rounded-lg border border-border">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Cuadrilla Técnica Asignada</h3>
                                <p className="text-xs text-muted-foreground">Técnicos, soldadores y operarios asignados al proyecto</p>
                            </div>
                            <Button 
                                size="sm" 
                                className="h-8 text-xs font-semibold"
                                onClick={() => setShowAddEmployee(!showAddEmployee)}
                            >
                                {showAddEmployee ? (
                                    <>
                                        <X className="w-3.5 h-3.5 mr-1.5" /> Cerrar Formulario
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Asignar Empleado
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Expandable Form: Assign Employee */}
                        {showAddEmployee && (
                            <Card className="border-primary/30 bg-primary/5 p-4 rounded-lg shadow-sm">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
                                    <Users className="w-4 h-4" /> Nueva Asignación de Personal
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                    <div>
                                        <label className="text-xs font-semibold block mb-1">Seleccionar Empleado *</label>
                                        <Select 
                                            value={employeeForm.employeeId} 
                                            onValueChange={(val) => setEmployeeForm(prev => ({ ...prev, employeeId: val }))}
                                        >
                                            <SelectTrigger className="h-8 text-xs bg-background">
                                                <SelectValue placeholder={loadingCatalogEmp ? "Cargando..." : "Seleccione empleado"} />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-56">
                                                {catalogEmployees.map((emp) => (
                                                    <SelectItem key={emp.id} value={emp.id} className="text-xs">
                                                        {emp.fullName} ({emp.specialty || 'Técnico'})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold block mb-1">Rol / Función en Proyecto *</label>
                                        <Input
                                            placeholder="Ej: Soldador 6G, Supervisor..."
                                            value={employeeForm.assignedRole}
                                            onChange={(e) => setEmployeeForm(prev => ({ ...prev, assignedRole: e.target.value }))}
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold block mb-1">Fecha de Asignación</label>
                                        <Input
                                            type="date"
                                            value={employeeForm.assignedDate}
                                            onChange={(e) => setEmployeeForm(prev => ({ ...prev, assignedDate: e.target.value }))}
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 text-xs" 
                                        onClick={() => setShowAddEmployee(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        className="h-8 text-xs font-semibold"
                                        disabled={!employeeForm.employeeId || !employeeForm.assignedRole.trim() || assignEmpMutation.isPending}
                                        onClick={() => assignEmpMutation.mutate(employeeForm)}
                                    >
                                        {assignEmpMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Confirmar Asignación
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Employees Table */}
                        <Card className="border-border">
                            <CardContent className="p-0">
                                {loadingEmp ? (
                                    <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                                ) : employees.length === 0 ? (
                                    <div className="py-10 text-center text-muted-foreground text-xs">
                                        No hay personal asignado a este proyecto actualmente.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-border/50 bg-secondary/20 text-xs">
                                                <TableHead className="font-semibold px-4">Empleado</TableHead>
                                                <TableHead className="font-semibold">Rol Asignado</TableHead>
                                                <TableHead className="font-semibold">Especialidad</TableHead>
                                                <TableHead className="font-semibold">Fecha Asignación</TableHead>
                                                <TableHead className="font-semibold text-right px-4">Acción</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {employees.map((e: any) => (
                                                <TableRow key={e.id} className="border-border/50 text-xs hover:bg-muted/40">
                                                    <TableCell className="px-4 font-semibold text-foreground">{e.employeeName}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200">
                                                            {e.assignedRole}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{e.specialty || '-'}</TableCell>
                                                    <TableCell className="text-muted-foreground">{e.assignedDate || '-'}</TableCell>
                                                    <TableCell className="px-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-7 h-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                            title="Retirar asignación"
                                                            disabled={removeEmpMutation.isPending}
                                                            onClick={() => removeEmpMutation.mutate(e.id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 2. MAQUINARIA TAB */}
                    <TabsContent value="maquinaria" className="space-y-4 flex-1 overflow-y-auto pr-1">
                        <div className="flex justify-between items-center bg-secondary/30 p-3 rounded-lg border border-border">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Maquinaria y Equipos en Obra</h3>
                                <p className="text-xs text-muted-foreground">Tornos, generadores, camiones grúa y máquinas de soldar asignadas</p>
                            </div>
                            <Button 
                                size="sm" 
                                className="h-8 text-xs font-semibold"
                                onClick={() => setShowAddMachinery(!showAddMachinery)}
                            >
                                {showAddMachinery ? (
                                    <>
                                        <X className="w-3.5 h-3.5 mr-1.5" /> Cerrar Formulario
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Asignar Equipo
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Expandable Form: Assign Machinery */}
                        {showAddMachinery && (
                            <Card className="border-amber-500/30 bg-amber-500/5 p-4 rounded-lg shadow-sm">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                                    <Tractor className="w-4 h-4" /> Asignación de Maquinaria
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                    <div>
                                        <label className="text-xs font-semibold block mb-1">Seleccionar Equipo *</label>
                                        <Select 
                                            value={machineryForm.machineryEquipmentId} 
                                            onValueChange={(val) => setMachineryForm(prev => ({ ...prev, machineryEquipmentId: val }))}
                                        >
                                            <SelectTrigger className="h-8 text-xs bg-background">
                                                <SelectValue placeholder={loadingCatalogMach ? "Cargando..." : "Seleccione equipo"} />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-56">
                                                {catalogMachinery.map((mach) => (
                                                    <SelectItem key={mach.id} value={mach.id} className="text-xs">
                                                        {mach.name} ({mach.code}) - {mach.status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold block mb-1">Fecha de Asignación *</label>
                                        <Input
                                            type="date"
                                            value={machineryForm.assignedDate}
                                            onChange={(e) => setMachineryForm(prev => ({ ...prev, assignedDate: e.target.value }))}
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold block mb-1">Fecha Retorno Estimada</label>
                                        <Input
                                            type="date"
                                            value={machineryForm.returnDate}
                                            onChange={(e) => setMachineryForm(prev => ({ ...prev, returnDate: e.target.value }))}
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 text-xs" 
                                        onClick={() => setShowAddMachinery(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        className="h-8 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                                        disabled={!machineryForm.machineryEquipmentId || assignMachMutation.isPending}
                                        onClick={() => assignMachMutation.mutate({
                                            machineryEquipmentId: machineryForm.machineryEquipmentId,
                                            assignedDate: machineryForm.assignedDate,
                                            returnDate: machineryForm.returnDate || undefined
                                        })}
                                    >
                                        {assignMachMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Asignando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Asignar a Obra
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Machinery Table */}
                        <Card className="border-border">
                            <CardContent className="p-0">
                                {loadingMach ? (
                                    <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                                ) : machinery.length === 0 ? (
                                    <div className="py-10 text-center text-muted-foreground text-xs">
                                        No hay maquinaria asignada a este proyecto.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-border/50 bg-secondary/20 text-xs">
                                                <TableHead className="font-semibold px-4">Equipo / Maquinaria</TableHead>
                                                <TableHead className="font-semibold">Código</TableHead>
                                                <TableHead className="font-semibold">Estado Operativo</TableHead>
                                                <TableHead className="font-semibold">Fecha Asignación</TableHead>
                                                <TableHead className="font-semibold">Fecha Retorno</TableHead>
                                                <TableHead className="font-semibold text-right px-4">Acción</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {machinery.map((m: any) => (
                                                <TableRow key={m.id} className="border-border/50 text-xs hover:bg-muted/40">
                                                    <TableCell className="px-4 font-semibold text-foreground">{m.machineryName}</TableCell>
                                                    <TableCell className="font-mono text-muted-foreground">{m.machineryCode}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200">
                                                            {m.status || 'EN_USO'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{m.assignedDate || '-'}</TableCell>
                                                    <TableCell className="text-muted-foreground">{m.returnDate || 'En operación'}</TableCell>
                                                    <TableCell className="px-4 text-right">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-xs text-muted-foreground hover:text-red-600 border-border"
                                                            title="Liberar maquinaria a almacén"
                                                            disabled={releaseMachMutation.isPending}
                                                            onClick={() => releaseMachMutation.mutate(m.id)}
                                                        >
                                                            Liberar Equipo
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 3. INVENTARIO TAB */}
                    <TabsContent value="inventario" className="space-y-4 flex-1 overflow-y-auto pr-1">
                        <div className="flex justify-between items-center bg-secondary/30 p-3 rounded-lg border border-border">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Consumo Real de Materiales e Insumos</h3>
                                <p className="text-xs text-muted-foreground">Registro de salidas de stock dedicadas exclusivamente a la ejecución del proyecto</p>
                            </div>
                            <Button 
                                size="sm" 
                                className="h-8 text-xs font-semibold"
                                onClick={() => setShowAddInventory(!showAddInventory)}
                            >
                                {showAddInventory ? (
                                    <>
                                        <X className="w-3.5 h-3.5 mr-1.5" /> Cerrar Formulario
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Registrar Consumo
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Expandable Form: Consume Inventory */}
                        {showAddInventory && (
                            <Card className="border-emerald-500/30 bg-emerald-500/5 p-4 rounded-lg shadow-sm">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                                    <Package className="w-4 h-4" /> Despacho y Consumo de Inventario
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                    <div>
                                        <label className="text-xs font-semibold block mb-1">Material / Insumo *</label>
                                        <Select 
                                            value={inventoryForm.inventoryItemId} 
                                            onValueChange={(val) => setInventoryForm(prev => ({ ...prev, inventoryItemId: val }))}
                                        >
                                            <SelectTrigger className="h-8 text-xs bg-background">
                                                <SelectValue placeholder={loadingCatalogInv ? "Cargando..." : "Seleccione material"} />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-56">
                                                {catalogInventory.map((item) => (
                                                    <SelectItem key={item.id} value={item.id} className="text-xs">
                                                        {item.name} (Stock: {item.stockQuantity})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedInventoryItem && (
                                            <span className="text-[10px] text-muted-foreground mt-0.5 block">
                                                SKU: {selectedInventoryItem.sku} • Stock disponible: <strong>{selectedInventoryItem.stockQuantity}</strong>
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold block mb-1">Cantidad a Consumir *</label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={selectedInventoryItem ? selectedInventoryItem.stockQuantity : undefined}
                                            value={inventoryForm.quantity}
                                            onChange={(e) => setInventoryForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold block mb-1">Motivo o Frente de Trabajo</label>
                                        <Input
                                            placeholder="Ej: Montaje tramo 1, Soldadura estructura..."
                                            value={inventoryForm.reason}
                                            onChange={(e) => setInventoryForm(prev => ({ ...prev, reason: e.target.value }))}
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 text-xs" 
                                        onClick={() => setShowAddInventory(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                                        disabled={!inventoryForm.inventoryItemId || inventoryForm.quantity < 1 || consumeInvMutation.isPending}
                                        onClick={() => consumeInvMutation.mutate({
                                            inventoryItemId: inventoryForm.inventoryItemId,
                                            quantity: inventoryForm.quantity,
                                            reason: inventoryForm.reason || undefined
                                        })}
                                    >
                                        {consumeInvMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Registrando salida...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Descontar de Almacén
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Inventory Table */}
                        <Card className="border-border">
                            <CardContent className="p-0">
                                {loadingInv ? (
                                    <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                                ) : inventory.length === 0 ? (
                                    <div className="py-10 text-center text-muted-foreground text-xs">
                                        No hay consumos de materiales registrados en este proyecto.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-border/50 bg-secondary/20 text-xs">
                                                <TableHead className="font-semibold px-4">Material / Insumo</TableHead>
                                                <TableHead className="font-semibold">SKU</TableHead>
                                                <TableHead className="font-semibold">Cantidad Consumida</TableHead>
                                                <TableHead className="font-semibold">Stock Restante</TableHead>
                                                <TableHead className="font-semibold">Fecha Consumo</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {inventory.map((item: any) => (
                                                <TableRow key={item.id} className="border-border/50 text-xs hover:bg-muted/40">
                                                    <TableCell className="px-4 font-semibold text-foreground">{item.itemName}</TableCell>
                                                    <TableCell className="font-mono text-muted-foreground">{item.itemSku}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200">
                                                            {item.quantityConsumed} unid.
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{item.remainingStock ?? '-'} unid.</TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {item.consumptionDate ? new Date(item.consumptionDate).toLocaleDateString('es-PE', {
                                                            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        }) : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};
