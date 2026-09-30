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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Power, PowerOff, Trash2 } from 'lucide-react';
import type { EmployeeResponseDTO } from '../types';
import { useToggleEmployeeStatus, useDeleteEmployee } from '../api';

interface EmployeesTableProps {
    employees: EmployeeResponseDTO[];
    isLoading: boolean;
    onEdit: (employee: EmployeeResponseDTO) => void;
}

export const EmployeesTable = ({ employees, isLoading, onEdit }: EmployeesTableProps) => {
    const { mutate: toggleStatus } = useToggleEmployeeStatus();
    const { mutate: deleteEmployee } = useDeleteEmployee();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48 border rounded-md bg-card">
                <span className="text-muted-foreground animate-pulse">Cargando empleados...</span>
            </div>
        );
    }

    if (employees.length === 0) {
        return (
            <div className="flex justify-center items-center h-48 border rounded-md bg-card">
                <span className="text-muted-foreground">No se encontraron empleados.</span>
            </div>
        );
    }

    return (
        <div className="border rounded-md bg-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Nombre</TableHead>
                        <TableHead>Especialidad</TableHead>
                        <TableHead>Contrato</TableHead>
                        <TableHead>Sueldo Base</TableHead>
                        <TableHead>Costo Hora</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((employee) => (
                        <TableRow key={employee.id} className="hover:bg-muted/30">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                                        {employee.fullName.trim().split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className={`font-semibold ${!employee.isAvailable ? 'text-muted-foreground' : 'text-foreground'}`}>
                                            {employee.fullName}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{employee.specialty}</TableCell>
                            <TableCell>{employee.contractType}</TableCell>
                            <TableCell>S/ {employee.baseSalary.toFixed(2)}</TableCell>
                            <TableCell>S/ {employee.currentHourlyCost.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge variant={employee.isAvailable ? 'default' : 'secondary'}>
                                    {employee.isAvailable ? 'Disponible' : 'No Disponible'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menú</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(employee)}>
                                            <Edit className="mr-2 h-4 w-4" /> Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toggleStatus(employee.id)}>
                                            {employee.isAvailable ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />} 
                                            {employee.isAvailable ? 'Marcar No Disponible' : 'Marcar Disponible'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                if(confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
                                                    deleteEmployee(employee.id);
                                                }
                                            }}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
