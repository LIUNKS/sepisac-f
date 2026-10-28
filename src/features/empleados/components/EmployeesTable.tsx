import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Power, PowerOff, Trash2, AlertTriangle, Loader2, Mail, UserCheck } from 'lucide-react';
import type { EmployeeResponseDTO } from '../types';
import { useToggleEmployeeStatus, useDeleteEmployee } from '../api';

interface EmployeesTableProps {
    employees: EmployeeResponseDTO[];
    isLoading: boolean;
    onEdit: (employee: EmployeeResponseDTO) => void;
}

export const EmployeesTable = ({ employees, isLoading, onEdit }: EmployeesTableProps) => {
    const { mutate: toggleStatus } = useToggleEmployeeStatus();
    const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee();

    const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeResponseDTO | null>(null);

    const handleConfirmDelete = () => {
        if (!employeeToDelete) return;
        deleteEmployee(employeeToDelete.id, {
            onSettled: () => setEmployeeToDelete(null)
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <span className="text-muted-foreground animate-pulse text-sm">Cargando personal...</span>
            </div>
        );
    }

    if (employees.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-48 p-6 text-center">
                <UserCheck className="w-10 h-10 text-muted-foreground opacity-30 mb-2" />
                <span className="text-foreground font-medium">No se encontraron empleados</span>
                <span className="text-xs text-muted-foreground mt-1">Intenta con otro término de búsqueda o registra un nuevo empleado.</span>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-secondary/20 hover:bg-transparent border-border/50">
                        <TableHead className="font-semibold text-muted-foreground px-6">Personal</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Especialidad</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Contrato</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Sueldo Base</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Costo / Hora</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Disponibilidad</TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-right px-6">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((employee) => (
                        <TableRow key={employee.id} className="hover:bg-muted/40 transition-colors border-border/50">
                            <TableCell className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                        {employee.fullName.trim().split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className={`font-semibold text-sm ${!employee.isAvailable ? 'text-muted-foreground' : 'text-foreground'}`}>
                                            {employee.fullName}
                                        </div>
                                        {employee.userEmail && (
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Mail className="w-3 h-3" />
                                                <span>{employee.userEmail}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium text-foreground">
                                {employee.specialty}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="text-xs font-medium border-border/80">
                                    {employee.contractType === 'PLANILLA' ? 'Planilla' : 'Locación'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-foreground">
                                {employee.contractType === 'LOCACION' && employee.baseSalary === 0
                                    ? <span className="text-xs text-muted-foreground italic">Por Horas</span>
                                    : <span className="font-medium">S/ {employee.baseSalary.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                }
                            </TableCell>
                            <TableCell className="text-sm font-bold text-foreground">
                                S/ {employee.currentHourlyCost.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">/ h</span>
                            </TableCell>
                            <TableCell>
                                <Badge 
                                    variant="secondary"
                                    className={`gap-1.5 font-medium ${
                                        employee.isAvailable
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                            : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        employee.isAvailable ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-amber-600 dark:bg-amber-400'
                                    }`}></span>
                                    {employee.isAvailable ? 'Disponible' : 'En Proyecto / No Disp.'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right px-6">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                            <span className="sr-only">Abrir menú</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => onEdit(employee)}>
                                            <Edit className="mr-2 h-4 w-4" /> Editar Datos
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toggleStatus(employee.id)}>
                                            {employee.isAvailable ? (
                                                <>
                                                    <PowerOff className="mr-2 h-4 w-4 text-amber-600" />
                                                    <span>Marcar No Disponible</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Power className="mr-2 h-4 w-4 text-emerald-600" />
                                                    <span>Marcar Disponible</span>
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => setEmployeeToDelete(employee)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Empleado
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Custom Confirmation Dialog (No native alert) */}
            <Dialog open={Boolean(employeeToDelete)} onOpenChange={(open) => !open && !isDeleting && setEmployeeToDelete(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 flex items-center justify-center mb-3">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-center text-lg">¿Eliminar Empleado?</DialogTitle>
                        <DialogDescription className="text-center pt-2 text-sm">
                            ¿Estás seguro de que deseas eliminar a <strong>{employeeToDelete?.fullName}</strong>?
                            Esta acción desvinculará al trabajador del sistema y no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-4 flex flex-row gap-2 justify-center sm:justify-center">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEmployeeToDelete(null)}
                            disabled={isDeleting}
                            className="w-full"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="w-full"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                'Sí, eliminar'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
