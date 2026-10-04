import { useState } from 'react';
import { Building2, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/app/store/useAuthStore';

import { useCompanies } from '../api';
import { CompaniesTable, CompanyFormModal } from '../components';

export const EmpresasPage = () => {
    // Solo SUPERADMIN debería ver esta página
    const hasRole = useAuthStore((state) => state.hasRole);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [page, setPage] = useState(0);
    const size = 10;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, isLoading } = useCompanies({
        search: debouncedSearch,
        page,
        size
    });

    if (!hasRole(['SUPERADMIN'])) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <h2 className="text-2xl font-bold text-destructive">Acceso Denegado</h2>
                <p className="text-muted-foreground">Solo el Super Administrador puede gestionar las empresas (Tenants).</p>
            </div>
        );
    }

    const companies = data?.content || [];
    const totalPages = data?.totalPages || 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Empresas</h2>
                        <p className="text-sm text-muted-foreground">
                            Gestiona los tenants (empresas) registrados en el sistema.
                        </p>
                    </div>
                </div>

                <Button onClick={() => setIsModalOpen(true)} className="shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Empresa
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border border-border/50">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por RUC o Razón Social..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(0); // reset page on search
                        }}
                        className="pl-9"
                    />
                </div>
            </div>

            <CompaniesTable companies={companies} isLoading={isLoading} />

            {/* Paginación simple */}
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

            <CompanyFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};
