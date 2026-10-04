import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Building2, Pencil, Search, Plus, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useSuppliers, useDeleteSupplier } from '../hooks/useSuppliers';
import { SupplierModal } from '../components/SupplierModal';
import type { Supplier } from '../types';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCompanies } from '@/features/empresas/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ComprasPage = () => {
    const { user, hasRole } = useAuthStore();
    const isSuperAdmin = hasRole(['SUPERADMIN']);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
    const [activeTab, setActiveTab] = useState('Proveedores');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

    const deleteMutation = useDeleteSupplier();

    const { data: companiesPage } = useCompanies({ page: 0, size: 100 }, isSuperAdmin);

    const effectiveCompanyId = isSuperAdmin
        ? (selectedCompanyId !== 'all' ? selectedCompanyId : undefined)
        : user?.companyId;

    const { data, isLoading } = useSuppliers({
        companyId: effectiveCompanyId,
        page: 0,
        size: 100,
        search: searchTerm,
        sort: 'businessName,asc'
    });

    const suppliers = data?.content || [];

    const handleEdit = (supplier: Supplier) => {
        setSupplierToEdit(supplier);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSupplierToEdit(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Â¿EstÃ¡ seguro de eliminar este proveedor?')) {
            deleteMutation.mutate(id);
        }
    };

    const tabs = [
        { id: 'Proveedores', label: 'Proveedores', icon: Building2 },

    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tabs */}
            <div className="flex flex-col sm:flex-row gap-4 border-b border-border/50 pb-px">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            relative px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2
                            ${activeTab === tab.id
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {activeTab === 'Proveedores' && (
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex flex-col sm:flex-row gap-4 w-full flex-1">
                                <div className="relative w-full sm:w-96">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por RUC o razon social"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 bg-background"
                                    />
                                </div>
                                {isSuperAdmin && (
                                    <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                                        <SelectTrigger className="w-full sm:w-[200px]">
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
                            </div>
                            <Button onClick={handleCreate}>
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Proveedor
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-semibold text-foreground/80 w-[150px]">RUC</TableHead>
                                        <TableHead className="font-semibold text-foreground/80">Razon Social</TableHead>
                                        <TableHead className="font-semibold text-foreground/80">Contacto</TableHead>
                                        <TableHead className="font-semibold text-foreground/80">Correo</TableHead>
                                        <TableHead className="text-right font-semibold text-foreground/80">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : suppliers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                No se encontraron proveedores.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        suppliers.map((supplier) => (
                                            <TableRow key={supplier.id} className="border-border/50 hover:bg-muted/50">
                                                <TableCell className="font-medium text-foreground">
                                                    {supplier.ruc}
                                                </TableCell>
                                                <TableCell className="font-semibold text-foreground">
                                                    {supplier.businessName}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {supplier.contactPhone || '-'}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {supplier.email || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10" onClick={() => handleEdit(supplier)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => handleDelete(supplier.id)}>
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
                    </CardContent>
                </Card>
            )}



            <SupplierModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                supplierToEdit={supplierToEdit}
            />
        </div>
    );
};


