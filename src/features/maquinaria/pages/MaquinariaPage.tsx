import { useState } from 'react';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useMachinery } from '../api';
import { MachineryTable, MachineryFormModal } from '../components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import type { MachineryResponseDTO } from '../types';

export const MaquinariaPage = () => {
    const user = useAuthStore((state) => state.user);
    const hasRole = useAuthStore((state) => state.hasRole);
    const isSuperAdmin = hasRole(['SUPERADMIN']);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const debouncedSearch = useDebounce(search, 500);
    const [page, setPage] = useState(0);
    const size = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [machineryToEdit, setMachineryToEdit] = useState<MachineryResponseDTO | null>(null);

    const { data, isLoading } = useMachinery(
        isSuperAdmin ? undefined : user?.companyId,
        {
            search: debouncedSearch,
            status: statusFilter === 'all' ? undefined : statusFilter,
            page,
            size,
            sort: 'createdAt,desc'
        }
    );

    const machineryList = data?.content || [];
    const totalPages = data?.totalPages || 0;

    const handleEdit = (machinery: MachineryResponseDTO) => {
        setMachineryToEdit(machinery);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setMachineryToEdit(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-1 gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por código o nombre..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                        />
                    </div>
                    
                    <Select 
                        value={statusFilter} 
                        onValueChange={(val) => {
                            setStatusFilter(val);
                            setPage(0);
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                            <SelectItem value="EN_USO">En Uso</SelectItem>
                            <SelectItem value="EN_MANTENIMIENTO">Mantenimiento</SelectItem>
                            <SelectItem value="DE_BAJA">De Baja</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <Button onClick={handleCreate} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Equipo
                </Button>
            </div>

            <MachineryTable 
                machinery={machineryList}
                isLoading={isLoading}
                onEdit={handleEdit}
            />

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        Anterior
                    </Button>
                    <span className="flex items-center text-sm text-muted-foreground">
                        Página {page + 1} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                    >
                        Siguiente
                    </Button>
                </div>
            )}

            <MachineryFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                machineryToEdit={machineryToEdit}
            />
        </div>
    );
};
