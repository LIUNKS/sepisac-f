import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Building2,
    Pencil,
    Search,
    Plus,
    Trash2,
    Loader2,
    Phone,
    Mail,
    DownloadCloud,
    AlertTriangle,
    FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useSuppliers, useDeleteSupplier } from '../hooks/useSuppliers';
import { SupplierModal } from '../components/SupplierModal';
import type { Supplier } from '../types';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCompanies } from '@/features/empresas/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportSuppliersToExcel } from '../utils/exportSuppliersToExcel';

export const ComprasPage = () => {
    const { user, hasRole } = useAuthStore();
    const isSuperAdmin = hasRole(['SUPERADMIN']);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'all' | 'con-telefono' | 'con-correo'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

    const deleteMutation = useDeleteSupplier();
    const { data: companiesPage } = useCompanies({ page: 0, size: 100 }, isSuperAdmin);

    const effectiveCompanyId = isSuperAdmin
        ? (selectedCompanyId !== 'all' ? selectedCompanyId : undefined)
        : user?.companyId;

    const { data, isLoading } = useSuppliers({
        companyId: effectiveCompanyId,
        page: 0,
        size: 1000,
        sort: 'businessName,asc'
    });

    const allSuppliers = data?.content || [];

    // KPI Metrics
    const totalCount = allSuppliers.length;
    const withPhoneCount = allSuppliers.filter(s => !!s.contactPhone && s.contactPhone.trim() !== '').length;
    const withEmailCount = allSuppliers.filter(s => !!s.email && s.email.trim() !== '').length;

    const kpiMetrics = [
        {
            title: 'Total Proveedores',
            value: totalCount,
            subtitle: 'Empresas proveedoras activas',
            icon: Building2,
            bg: 'bg-secondary text-muted-foreground'
        },
        {
            title: 'RUCs Registrados',
            value: totalCount,
            subtitle: 'Identificación tributaria 11 dígitos',
            icon: FileText,
            bg: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
        },
        {
            title: 'Con Teléfono',
            value: withPhoneCount,
            subtitle: 'Contacto telefónico registrado',
            icon: Phone,
            bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
        },
        {
            title: 'Con Correo',
            value: withEmailCount,
            subtitle: 'Envío directo de órdenes de compra',
            icon: Mail,
            bg: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
        }
    ];

    // Filter suppliers
    const filteredSuppliers = useMemo(() => {
        let list = allSuppliers;

        if (activeTab === 'con-telefono') {
            list = list.filter(s => !!s.contactPhone && s.contactPhone.trim() !== '');
        } else if (activeTab === 'con-correo') {
            list = list.filter(s => !!s.email && s.email.trim() !== '');
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            list = list.filter(s =>
                s.ruc?.toLowerCase().includes(term) ||
                s.businessName?.toLowerCase().includes(term) ||
                s.contactPhone?.toLowerCase().includes(term) ||
                s.email?.toLowerCase().includes(term) ||
                s.companyName?.toLowerCase().includes(term)
            );
        }

        return list;
    }, [allSuppliers, activeTab, searchTerm]);

    // Paginated slice
    const totalPages = Math.ceil(filteredSuppliers.length / pageSize);
    const paginatedSuppliers = useMemo(() => {
        const start = page * pageSize;
        return filteredSuppliers.slice(start, start + pageSize);
    }, [filteredSuppliers, page, pageSize]);

    const tabs = [
        { id: 'all' as const, label: 'Todos', count: totalCount },
        { id: 'con-telefono' as const, label: 'Con Teléfono', count: withPhoneCount },
        { id: 'con-correo' as const, label: 'Con Correo', count: withEmailCount },
    ];

    const handleEdit = (supplier: Supplier) => {
        setSupplierToEdit(supplier);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSupplierToEdit(null);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!supplierToDelete) return;
        deleteMutation.mutate(supplierToDelete.id, {
            onSettled: () => setSupplierToDelete(null)
        });
    };

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiMetrics.map((kpi, idx) => (
                    <Card key={idx} className="border-border shadow-sm relative overflow-hidden">
                        <CardContent className="p-6">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                                {kpi.title}
                            </span>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-3xl font-bold tracking-tight text-foreground">
                                    {isLoading ? '...' : kpi.value}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>{kpi.subtitle}</span>
                            </div>

                            <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Table Card with Unified Toolbar */}
            <Card className="border-border shadow-sm">
                <div className="border-b border-border p-0">
                    <div className="flex items-center justify-between px-6 pt-4 gap-4 flex-nowrap overflow-x-auto">
                        {/* Tabs with Counts */}
                        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setPage(0);
                                    }}
                                    className={`pb-3.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${activeTab === tab.id
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-secondary text-muted-foreground'
                                        }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search, Filter, Export and Create Actions in unified toolbar */}
                        <div className="flex items-center gap-2 mb-2.5 shrink-0">
                            {isSuperAdmin && (
                                <Select
                                    value={selectedCompanyId}
                                    onValueChange={(val) => {
                                        setSelectedCompanyId(val);
                                        setPage(0);
                                    }}
                                >
                                    <SelectTrigger className="h-8 text-xs w-36 sm:w-44 bg-background">
                                        <SelectValue placeholder="Todas las empresas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las empresas</SelectItem>
                                        {companiesPage?.content.map((company) => (
                                            <SelectItem key={company.id} value={company.id}>
                                                {company.businessName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            <div className="relative w-44 sm:w-56">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por RUC o razón social..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(0);
                                    }}
                                    className="h-8 pl-8 text-xs bg-background"
                                />
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-medium px-2.5"
                                onClick={() => exportSuppliersToExcel(filteredSuppliers)}
                                disabled={filteredSuppliers.length === 0}
                            >
                                <DownloadCloud className="w-3.5 h-3.5 mr-1 text-primary" />
                                Exportar
                            </Button>

                            <Button
                                size="sm"
                                className="h-8 text-xs font-medium shadow-sm px-3"
                                onClick={handleCreate}
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Nuevo Proveedor
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-secondary/20 hover:bg-transparent border-border/50">
                                    <TableHead className="font-semibold text-muted-foreground px-6 w-[160px]">RUC</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Razón Social</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Teléfono Contacto</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Correo Electrónico</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground text-right px-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                <span className="text-xs text-muted-foreground">Cargando directorio de proveedores...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedSuppliers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-2">
                                                <Building2 className="w-10 h-10 text-muted-foreground opacity-30" />
                                                <span className="text-foreground font-medium">No se encontraron proveedores</span>
                                                <span className="text-xs text-muted-foreground">
                                                    Intenta con otro término de búsqueda o registra un nuevo proveedor.
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedSuppliers.map((supplier) => (
                                        <TableRow key={supplier.id} className="border-border/50 hover:bg-muted/50">
                                            <TableCell className="px-6 py-4 font-mono font-bold text-foreground">
                                                {supplier.ruc}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-foreground">
                                                    {supplier.businessName}
                                                </div>
                                                {supplier.companyName && (
                                                    <div className="text-[11px] text-muted-foreground mt-0.5">
                                                        Empresa: {supplier.companyName}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {supplier.contactPhone ? (
                                                    <a
                                                        href={`tel:${supplier.contactPhone}`}
                                                        className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                                                    >
                                                        <Phone className="w-3.5 h-3.5 opacity-60" />
                                                        {supplier.contactPhone}
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/60">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {supplier.email ? (
                                                    <a
                                                        href={`mailto:${supplier.email}`}
                                                        className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                                                    >
                                                        <Mail className="w-3.5 h-3.5 opacity-60" />
                                                        {supplier.email}
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/60">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                        onClick={() => handleEdit(supplier)}
                                                        title="Editar proveedor"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => setSupplierToDelete(supplier)}
                                                        title="Eliminar proveedor"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </Card>

            {/* Pagination Controls */}
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

            {/* Modal de edición / creación */}
            <SupplierModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                supplierToEdit={supplierToEdit}
            />

            {/* Modal de confirmación para eliminar */}
            <Dialog open={!!supplierToDelete} onOpenChange={(open) => !open && setSupplierToDelete(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 text-destructive mb-2">
                            <div className="p-2.5 rounded-full bg-destructive/10">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                            </div>
                            <DialogTitle className="text-destructive">Eliminar Proveedor</DialogTitle>
                        </div>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar al proveedor{' '}
                            <span className="font-semibold text-foreground">{supplierToDelete?.businessName}</span> (RUC: {supplierToDelete?.ruc})?
                            Esta acción realizará una baja lógica y no estará disponible para nuevas órdenes de compra.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSupplierToDelete(null)}
                            disabled={deleteMutation.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
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
