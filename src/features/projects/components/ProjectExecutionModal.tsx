import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Users, Tractor, Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { 
    getEmployeeAssignments, 
    getMachineryAssignments, 
    getInventoryConsumptions,
    assignEmployee,
    assignMachinery,
    consumeInventory
} from '../services/projectService';
import type { Project } from '../types';

interface ProjectExecutionModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ProjectExecutionModal = ({ project, isOpen, onClose }: ProjectExecutionModalProps) => {
    const [activeTab, setActiveTab] = useState('personal');
    // const queryClient = useQueryClient();

    // Data queries
    const { data: employees, isLoading: loadingEmp } = useQuery({
        queryKey: ['project-employees', project?.id],
        queryFn: () => getEmployeeAssignments(project?.id as string),
        enabled: !!project && isOpen && activeTab === 'personal'
    });

    const { data: machinery, isLoading: loadingMach } = useQuery({
        queryKey: ['project-machinery', project?.id],
        queryFn: () => getMachineryAssignments(project?.id as string),
        enabled: !!project && isOpen && activeTab === 'maquinaria'
    });

    const { data: inventory, isLoading: loadingInv } = useQuery({
        queryKey: ['project-inventory', project?.id],
        queryFn: () => getInventoryConsumptions(project?.id as string),
        enabled: !!project && isOpen && activeTab === 'inventario'
    });

    if (!project) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-card border-border shadow-lg">
                <DialogHeader className="border-b border-border pb-4">
                    <DialogTitle className="text-xl font-bold">
                        GestiÃ³n de Recursos: {project.title}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="personal" className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> Personal
                        </TabsTrigger>
                        <TabsTrigger value="maquinaria" className="flex items-center gap-2">
                            <Tractor className="w-4 h-4" /> Maquinaria
                        </TabsTrigger>
                        <TabsTrigger value="inventario" className="flex items-center gap-2">
                            <Package className="w-4 h-4" /> Inventario
                        </TabsTrigger>
                    </TabsList>

                    {/* Personal Tab */}
                    <TabsContent value="personal" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Personal Asignado</h3>
                            {/* Dummy button that would open a real assignment form */}
                            <Button size="sm" onClick={() => toast.info('FunciÃ³n de asignaciÃ³n en desarrollo')}>
                                <Plus className="w-4 h-4 mr-2" /> Asignar Empleado
                            </Button>
                        </div>
                        <Card>
                            <CardContent className="p-0">
                                {loadingEmp ? (
                                    <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                                ) : (
                                    <div className="p-4 text-sm text-muted-foreground">
                                        {employees?.length ? (
                                            <ul className="space-y-2">
                                                {employees.map((e: any) => (
                                                    <li key={e.id} className="flex justify-between border-b pb-2">
                                                        <span>{e.employeeName} - {e.assignedRole}</span>
                                                        <span>{e.assignedDate}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-center py-4">No hay personal asignado</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Maquinaria Tab */}
                    <TabsContent value="maquinaria" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Maquinaria Asignada</h3>
                            <Button size="sm" onClick={() => toast.info('FunciÃ³n de asignaciÃ³n en desarrollo')}>
                                <Plus className="w-4 h-4 mr-2" /> Asignar Equipo
                            </Button>
                        </div>
                        <Card>
                            <CardContent className="p-0">
                                {loadingMach ? (
                                    <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                                ) : (
                                    <div className="p-4 text-sm text-muted-foreground">
                                        {machinery?.length ? (
                                            <ul className="space-y-2">
                                                {machinery.map((m: any) => (
                                                    <li key={m.id} className="flex justify-between border-b pb-2">
                                                        <span>{m.machineryName} ({m.machineryCode})</span>
                                                        <span>{m.assignedDate}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-center py-4">No hay maquinaria asignada</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Inventario Tab */}
                    <TabsContent value="inventario" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Consumo de Materiales</h3>
                            <Button size="sm" onClick={() => toast.info('FunciÃ³n de consumo en desarrollo')}>
                                <Plus className="w-4 h-4 mr-2" /> Registrar Consumo
                            </Button>
                        </div>
                        <Card>
                            <CardContent className="p-0">
                                {loadingInv ? (
                                    <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                                ) : (
                                    <div className="p-4 text-sm text-muted-foreground">
                                        {inventory?.length ? (
                                            <ul className="space-y-2">
                                                {inventory.map((i: any) => (
                                                    <li key={i.id} className="flex justify-between border-b pb-2">
                                                        <span>{i.itemName} (SKU: {i.itemSku})</span>
                                                        <span>{i.quantityConsumed} unid.</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-center py-4">No hay materiales consumidos</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

