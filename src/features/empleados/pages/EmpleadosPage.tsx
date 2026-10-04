import { useState } from 'react';
import { Users, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useEmployees } from '../api';
import { EmployeesTable, EmployeeFormModal } from '../components';
import type { EmployeeResponseDTO } from '../types';

export const EmpleadosPage = () => {
    const user = useAuthStore((state) => state.user);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    
    const [page, setPage] = useState(0);
    const size = 10;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<EmployeeResponseDTO | null>(null);

    const { data, isLoading } = useEmployees(user?.companyId, {
        search: debouncedSearch,
        page,
        size
    });

    const employees = data?.content || [];
    const totalPages = data?.totalPages || 0;

    const handleEdit = (employee: EmployeeResponseDTO) => {
        setEmployeeToEdit(employee);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Empleados</h2>
                        <p className="text-sm text-muted-foreground">
                            Gestiona el personal, contratos y costos hora de tu empresa.
                        </p>
                    </div>
                </div>

                <Button 
                    onClick={() => {
                        setEmployeeToEdit(null);
                        setIsModalOpen(true);
                    }} 
                    className="shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Empleado
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border border-border/50">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o especialidad..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(0);
                        }}
                        className="pl-9"
                    />
                </div>
            </div>

            <EmployeesTable 
                employees={employees} 
                isLoading={isLoading} 
                onEdit={handleEdit}
            />

            {!isLoading && totalPages > 1 && (
                <div className="flex justify-end items-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Página {page + 1} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                    >
                        Siguiente
                    </Button>
                </div>
            )}

            <EmployeeFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employeeToEdit={employeeToEdit}
            />
        </div>
    );
};
