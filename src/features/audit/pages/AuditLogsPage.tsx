import { useState } from 'react';
import { useAuditLogs } from '../api';
import { AuditLogsTable, AuditLogDetailsModal } from '../components';
import type { AuditLogResponseDTO, AuditLogFilterDTO } from '../types';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCompanies } from '@/features/empresas/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export const AuditLogsPage = () => {
    const { user, hasRole } = useAuthStore();
    const isSuperAdmin = hasRole(['SUPERADMIN']);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
    
    // Filters state
    const [moduleFilter, setModuleFilter] = useState<string>('all');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [entityIdSearch, setEntityIdSearch] = useState<string>('');
    const debouncedEntityId = useDebounce(entityIdSearch, 500);

    const [page, setPage] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditLogResponseDTO | null>(null);

    const { data: companiesPage } = useCompanies({ page: 0, size: 100 }, isSuperAdmin);

    const effectiveCompanyId = isSuperAdmin
        ? (selectedCompanyId !== 'all' ? selectedCompanyId : undefined)
        : user?.companyId;

    const filters: AuditLogFilterDTO = {
        companyId: effectiveCompanyId,
        module: moduleFilter !== 'all' ? moduleFilter : undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        entityId: debouncedEntityId || undefined,
        page,
        size: 50,
        sort: 'createdAt,desc'
    };

    const isEnabled = !isSuperAdmin || effectiveCompanyId !== undefined;
    const { data: logsPage, isLoading } = useAuditLogs(filters, isEnabled);

    const handleViewDetails = (log: AuditLogResponseDTO) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const clearFilters = () => {
        setModuleFilter('all');
        setActionFilter('all');
        setEntityIdSearch('');
        setPage(0);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Logs de AuditorÃ­a</h2>
                    <p className="text-muted-foreground">Trazabilidad gerencial y registro de eventos del sistema</p>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                    <div className="flex flex-col md:flex-row gap-4 flex-wrap items-end">
                        {isSuperAdmin && (
                            <div className="space-y-1 w-full md:w-auto">
                                <span className="text-xs font-medium text-muted-foreground">Empresa (Tenant)</span>
                                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                                    <SelectTrigger className="w-full md:w-[200px]">
                                        <SelectValue placeholder="Seleccionar empresa..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Seleccionar empresa...</SelectItem>
                                        {companiesPage?.content.map((company) => (
                                            <SelectItem key={company.id} value={company.id}>
                                                {company.businessName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-1 w-full md:w-auto">
                            <span className="text-xs font-medium text-muted-foreground">MÃ³dulo Afectado</span>
                            <Select value={moduleFilter} onValueChange={(v) => { setModuleFilter(v); setPage(0); }}>
                                <SelectTrigger className="w-full md:w-[160px]">
                                    <SelectValue placeholder="MÃ³dulo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los mÃ³dulos</SelectItem>
                                    <SelectItem value="QUOTATIONS">Cotizaciones</SelectItem>
                                    <SelectItem value="PROJECTS">Proyectos</SelectItem>
                                    <SelectItem value="INVENTORY">Inventario</SelectItem>
                                    <SelectItem value="MACHINERY">Maquinaria</SelectItem>
                                    <SelectItem value="USERS">Usuarios</SelectItem>
                                    <SelectItem value="SUPPLIERS">Proveedores</SelectItem>
                                    <SelectItem value="INVOICES">FacturaciÃ³n</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1 w-full md:w-auto">
                            <span className="text-xs font-medium text-muted-foreground">AcciÃ³n</span>
                            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
                                <SelectTrigger className="w-full md:w-[150px]">
                                    <SelectValue placeholder="AcciÃ³n" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las acciones</SelectItem>
                                    <SelectItem value="CREATE">Crear</SelectItem>
                                    <SelectItem value="UPDATE">Modificar</SelectItem>
                                    <SelectItem value="DELETE">Eliminar</SelectItem>
                                    <SelectItem value="APPROVE">Aprobar</SelectItem>
                                    <SelectItem value="REJECT">Rechazar</SelectItem>
                                    <SelectItem value="LOGIN">Login</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1 flex-1 min-w-[200px]">
                            <span className="text-xs font-medium text-muted-foreground">Buscar Entidad (ID)</span>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="UUID de la entidad..."
                                    className="pl-8"
                                    value={entityIdSearch}
                                    onChange={(e) => { setEntityIdSearch(e.target.value); setPage(0); }}
                                />
                            </div>
                        </div>

                        {(moduleFilter !== 'all' || actionFilter !== 'all' || entityIdSearch !== '') && (
                            <Button variant="ghost" className="text-muted-foreground" onClick={clearFilters}>
                                <X className="h-4 w-4 mr-2" />
                                Limpiar Filtros
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <AuditLogsTable
                        logs={logsPage?.content || []}
                        isLoading={isLoading}
                        onViewDetails={handleViewDetails}
                    />
                    
                    {/* Pagination controls simple */}
                    {logsPage && logsPage.totalPages > 1 && (
                        <div className="flex justify-between items-center p-4 border-t bg-muted/10">
                            <span className="text-sm text-muted-foreground">
                                Mostrando pÃ¡gina {logsPage.pageNumber + 1} de {logsPage.totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={logsPage.pageNumber === 0}
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                >
                                    Anterior
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={logsPage.pageNumber >= logsPage.totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AuditLogDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                log={selectedLog}
            />
        </div>
    );
};



