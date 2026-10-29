import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, DownloadCloud, Archive, AlertTriangle, CircleDollarSign, MapPin, Search, Building2, Package, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCompanies } from '@/features/empresas/api/empresas';
import { getInventory, deleteInventoryItem } from '../services/inventory.service';
import { CreateInventoryItemModal } from '../components/CreateInventoryItemModal';
import { toast } from 'sonner';
import { EditInventoryItemModal } from '../components/EditInventoryItemModal';
import { ViewInventoryItemModal } from '../components/ViewInventoryItemModal';
import type { InventoryItem } from '../types';
import { exportInventoryToExcel } from '../utils/exportInventoryToExcel';
import { PurchaseOrdersTab } from '../components/PurchaseOrdersTab';

export const InventarioPage = () => {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role === 'SUPERADMIN' || user?.role === 'ROLE_SUPERADMIN';

    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [activeTab, setActiveTab] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [itemToView, setItemToView] = useState<InventoryItem | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const queryClient = useQueryClient();

    // List companies if superadmin without fixed company
    const { data: companiesData } = useCompanies(
        { page: 0, size: 50 },
        isSuperAdmin && !user?.companyId
    );

    useEffect(() => {
        if (user?.companyId) {
            setSelectedCompanyId(user.companyId);
        } else if (companiesData?.content && companiesData.content.length > 0 && !selectedCompanyId) {
            setSelectedCompanyId(companiesData.content[0].id);
        }
    }, [user?.companyId, companiesData]);

        const handleDeleteItem = async (id: string, name: string) => {
        if (!window.confirm(`¿Está seguro de que desea eliminar el artículo "${name}" del inventario?`)) return;
        try {
            await deleteInventoryItem(id);
            toast.success(`Artículo "${name}" eliminado exitosamente`);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Error al eliminar el artículo');
        }
    };

    const activeCompanyId = user?.companyId || selectedCompanyId || undefined;

    const { data, isPending, isLoading, error } = useQuery({
        queryKey: ['inventory', activeCompanyId],
        queryFn: () => getInventory(activeCompanyId),
        enabled: !isSuperAdmin || Boolean(activeCompanyId)
    });

    const inventoryData = data?.content || [];

    const lowStockCount = inventoryData.filter(i => i.isLowStock).length;
    const consumiblesCount = inventoryData.filter(i => i.category === 'Consumibles y Soldadura').length;
    const repuestosCount = inventoryData.filter(i => i.category === 'Repuestos Mecánicos').length;
    const lubricantesCount = inventoryData.filter(i => i.category === 'Lubricantes y Fluidos').length;

    const tabs = [
        { id: 'Todos', label: 'Todos', count: inventoryData.length },
        { id: 'Alertas', label: 'Bajo Stock / Alertas', count: lowStockCount, isAlert: true },
        { id: 'Consumibles y Soldadura', label: 'Consumibles y Soldadura', count: consumiblesCount },
        { id: 'Repuestos Mecánicos', label: 'Repuestos Mecánicos', count: repuestosCount },
        { id: 'Lubricantes y Fluidos', label: 'Lubricantes y Fluidos', count: lubricantesCount },
        { id: 'Ordenes', label: 'Órdenes de Compra' },
    ];

    const filteredData = inventoryData.filter(item => {
        // Tab filter
        let matchesTab = true;
        if (activeTab === 'Todos') matchesTab = true;
        else if (activeTab === 'Alertas') matchesTab = Boolean(item.isLowStock);
        else if (activeTab !== 'Ordenes') matchesTab = item.category === activeTab;

        if (!matchesTab) return false;

        // Search filter
        if (searchTerm.trim() !== '') {
            const query = searchTerm.toLowerCase();
            const matchesName = item.name.toLowerCase().includes(query);
            const matchesSku = item.sku.toLowerCase().includes(query);
            const matchesCategory = (item.category || '').toLowerCase().includes(query);
            const matchesLocation = (item.location || '').toLowerCase().includes(query);
            return matchesName || matchesSku || matchesCategory || matchesLocation;
        }

        return true;
    });

    const totalValor = inventoryData.reduce((acc, curr) => acc + (curr.stockQuantity * curr.purchaseCost), 0);

    const kpisData = [
        {
            title: 'Total de Artículos',
            value: inventoryData.length.toString(),
            trend: 'Ítems en catálogo',
            trendType: 'success',
            icon: Archive,
            alert: false
        },
        {
            title: 'Alertas de Stock',
            value: lowStockCount.toString(),
            trend: lowStockCount > 0 ? 'Requieren reabastecimiento' : 'Stock en niveles óptimos',
            trendType: lowStockCount > 0 ? 'warning' : 'success',
            icon: AlertTriangle,
            alert: lowStockCount > 0
        },
        {
            title: 'Valor del Inventario',
            value: `S/ ${totalValor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            trend: 'Basado en costo de adquisición',
            trendType: 'success',
            icon: CircleDollarSign,
            alert: false
        },
    ];

    if (error) {
        return (
            <div className="text-center py-10 text-red-500">
                <p className="font-bold text-lg">Error al cargar el inventario</p>
                <p className="text-sm mt-2">{error instanceof Error ? error.message : JSON.stringify(error)}</p>
            </div>
        );
    }

    if (isLoading || isPending) {
        return <div className="text-center py-10 text-muted-foreground">Cargando inventario...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header with Superadmin Company Selector */}
            {isSuperAdmin && companiesData?.content && companiesData.content.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2 bg-card p-1.5 rounded-lg border border-border shadow-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground ml-2" />
                        <span className="text-xs font-semibold text-muted-foreground">Empresa:</span>
                        <Select
                            value={selectedCompanyId}
                            onValueChange={(val) => setSelectedCompanyId(val)}
                        >
                            <SelectTrigger className="w-[220px] h-8 text-xs font-medium">
                                <SelectValue placeholder="Seleccionar empresa" />
                            </SelectTrigger>
                            <SelectContent>
                                {companiesData.content.map(c => (
                                    <SelectItem key={c.id} value={c.id} className="text-xs">
                                        {c.businessName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpisData.map((kpi, idx) => (
                    <Card key={idx} className={`border-border shadow-sm relative overflow-hidden ${kpi.alert ? 'border-l-4 border-l-amber-500' : ''}`}>
                        <CardContent className="p-6">
                            <p className="text-sm font-semibold text-muted-foreground mb-2">{kpi.title}</p>
                            <h3 className="text-3xl font-bold text-foreground mb-2">{kpi.value}</h3>
                            <div className={`text-xs font-medium flex items-center gap-1.5 ${kpi.trendType === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                                }`}>
                                <span>{kpi.trend}</span>
                            </div>

                            <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center ${kpi.alert
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                                : 'bg-secondary text-muted-foreground'
                                }`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Card */}
            <Card className="border-border shadow-sm">
                <CardHeader className="p-0 border-b border-border">
                    <div className="flex justify-between items-center px-6 mt-4 flex-wrap gap-4">
                        {/* Tabs */}
                        <div className="flex gap-4 sm:gap-6 flex-wrap">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 text-sm font-medium transition-colors border-b-2 -mb-[1px] flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    {tab.count !== undefined && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${tab.isAlert && tab.count > 0
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                            : activeTab === tab.id
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-secondary text-muted-foreground'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Search and Export Actions */}
                        {activeTab !== 'Ordenes' && (
                            <div className="flex items-center gap-3 mb-3">
                                <div className="relative w-56 sm:w-64">
                                    <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por código, nombre..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-8 pl-8 text-xs bg-background"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs font-medium"
                                    onClick={() => exportInventoryToExcel(filteredData)}
                                >
                                    <DownloadCloud className="w-3.5 h-3.5 mr-1.5 text-primary" />
                                    Exportar Excel
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-8 text-xs font-medium bg-primary text-primary-foreground gap-1.5"
                                    onClick={() => setIsCreateModalOpen(true)}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Nuevo Artículo
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>

                {activeTab === 'Ordenes' ? (
                    <CardContent className="p-6">
                        <PurchaseOrdersTab />
                    </CardContent>
                ) : (
                    <CardContent className="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/50 hover:bg-transparent bg-secondary/20">
                                    <TableHead className="text-muted-foreground font-semibold px-6">Artículo</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Código SKU</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Categoría</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Ubicación Almacén</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Stock / Existencias</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Estado</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold text-right px-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((item) => (
                                    <TableRow key={item.id} className="border-border/50 hover:bg-secondary/40 transition-colors">
                                        <TableCell className="px-6 py-4 max-w-xs">
                                            <div>
                                                <p className="font-semibold text-foreground text-sm">{item.name}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1" title={item.description}>
                                                    {item.description}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-xs font-mono font-medium text-foreground">
                                            {item.sku}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="outline" className="text-[11px] font-normal border-border/80">
                                                {item.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 text-sm text-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                <span className="font-medium text-xs text-muted-foreground">{item.location}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-foreground text-sm">{item.stockQuantity}</span>
                                                <span className="text-xs text-muted-foreground">{item.unit}</span>
                                            </div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                Mín. alerta: {item.minStockAlert} {item.unit}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge
                                                variant="secondary"
                                                className={`gap-1.5 font-medium ${item.stockQuantity <= 0
                                                    ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100'
                                                    : item.isLowStock
                                                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 hover:bg-amber-100'
                                                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.stockQuantity <= 0 ? 'bg-red-600 dark:bg-red-400' :
                                                    item.isLowStock ? 'bg-amber-600 dark:bg-amber-400' :
                                                        'bg-emerald-600 dark:bg-emerald-400'
                                                    }`}></span>
                                                {item.stockQuantity <= 0 ? 'Agotado' : item.isLowStock ? 'Bajo Stock' : 'Normal'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 text-right px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    title="Ver Detalle"
                                                    onClick={() => {
                                                        setItemToView(item);
                                                        setIsViewModalOpen(true);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    title="Editar Ítem"
                                                    onClick={() => {
                                                        setItemToEdit(item);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-rose-500"
                                                    title="Eliminar Ítem"
                                                    onClick={() => handleDeleteItem(item.id, item.name)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            {searchTerm
                                                ? `No se encontraron ítems que coincidan con "${searchTerm}".`
                                                : 'No hay ítems registrados en esta categoría.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                )}
            </Card>

            <ViewInventoryItemModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setItemToView(null);
                }}
                item={itemToView}
            />

            <EditInventoryItemModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setItemToEdit(null);
                }}
                item={itemToEdit}
            />

            <CreateInventoryItemModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                companyId={activeCompanyId}
            />
        </div>
    );
};
