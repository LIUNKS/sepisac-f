import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, DownloadCloud, Archive, AlertTriangle, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/app/store/useAuthStore';
import { getInventory } from '../services/inventory.service';
import { apiClient } from '@/lib/axios';

export const InventarioPage = () => {
    const [activeTab, setActiveTab] = useState('Todos');
    const { user } = useAuthStore();

    const queryClient = useQueryClient();

    const { data, isPending, isLoading, error } = useQuery({
        queryKey: ['inventory', user?.companyId],
        queryFn: () => getInventory(user?.companyId || '')
    });

    const seedMutation = useMutation({
        mutationFn: async () => {
            if (!user?.companyId) {
                throw new Error("No tienes una empresa asignada para generar datos de prueba.");
            }
            await apiClient.post(`/inventory/items/seed/${user?.companyId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        }
    });

    const inventoryData = data?.content || [];

    const tabs = [
        { id: 'Todos', label: `Todos (${inventoryData.length})`, showBadge: false },
        { id: 'Alertas', label: 'Alertas', showBadge: true, count: inventoryData.filter(i => i.isLowStock).length },
        { id: 'Herramientas', label: `Herramientas`, showBadge: false },
        { id: 'Consumibles', label: `Consumibles`, showBadge: false },
        { id: 'EPP', label: `EPP`, showBadge: false },
    ];

    const filteredData = inventoryData.filter(item => {
        if (activeTab === 'Todos') return true;
        if (activeTab === 'Alertas') return item.isLowStock;
        return item.category === activeTab;
    });

    const totalValor = inventoryData.reduce((acc, curr) => acc + (curr.stockQuantity * curr.purchaseCost), 0);
    const lowStockCount = inventoryData.filter(i => i.isLowStock).length;

    const kpisData = [
        { title: 'Total de Artículos', value: inventoryData.length.toString(), trend: 'En catálogo', trendType: 'success', icon: Archive, alert: false },
        { title: 'Alertas de Stock', value: lowStockCount.toString(), trend: 'Requieren reabastecimiento', trendType: 'warning', icon: AlertTriangle, alert: lowStockCount > 0 },
        { title: 'Valor del Inventario', value: `S/ ${totalValor.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, trend: 'Basado en costo de compra', trendType: 'success', icon: CircleDollarSign, alert: false },
    ];

    if (error) {
        return (
            <div className="text-center py-10 text-red-500">
                <p className="font-bold text-lg">Error al cargar el inventario</p>
                <p className="text-sm mt-2">{error instanceof Error ? error.message : JSON.stringify(error)}</p>
            </div>
        );
    }

    if (isLoading || isPending || !data) {
        return <div className="text-center py-10 text-muted-foreground">Cargando inventario...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Inventario</h2>
                {inventoryData.length === 0 && (
                    <Button 
                        onClick={() => seedMutation.mutate()} 
                        disabled={seedMutation.isPending}
                        variant="outline" 
                        className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    >
                        {seedMutation.isPending ? 'Generando...' : 'Generar Datos de Prueba'}
                    </Button>
                )}
            </div>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpisData.map((kpi, idx) => (
                    <Card key={idx} className={`border-border shadow-sm relative overflow-hidden ${kpi.alert ? 'border-l-4 border-l-amber-500' : ''}`}>
                        <CardContent className="p-6">
                            <p className="text-sm font-semibold text-muted-foreground mb-2">{kpi.title}</p>
                            <h3 className="text-3xl font-bold text-foreground mb-2">{kpi.value}</h3>
                            <div className={`text-xs font-medium flex items-center gap-1.5 ${
                                kpi.trendType === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                            }`}>
                                <span>{kpi.trend}</span>
                            </div>
                            
                            <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center ${
                                kpi.alert 
                                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' 
                                    : 'bg-secondary text-muted-foreground'
                            }`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Card */}
            <Card className="border-border shadow-sm">
                <CardHeader className="p-0 border-b border-border">
                    <div className="flex justify-between items-center px-6 mt-4">
                        <div className="flex gap-6 overflow-x-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 text-sm font-medium transition-colors border-b-2 -mb-[1px] flex items-center gap-2 whitespace-nowrap ${
                                        activeTab === tab.id 
                                            ? 'border-primary text-primary' 
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab.label}
                                    {tab.showBadge && tab.count > 0 && (
                                        <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 mb-3 h-8 text-sm shrink-0">
                            <DownloadCloud className="w-4 h-4 mr-2" />
                            Exportar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent bg-secondary/20">
                                <TableHead className="text-muted-foreground font-semibold px-6">Artículo</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Código</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Ubicación</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Stock Actual</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Estado</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right px-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((item) => (
                                <TableRow key={item.id} className="border-border/50 hover:bg-secondary/40 transition-colors">
                                    <TableCell className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-foreground">{item.name}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 text-sm font-medium text-muted-foreground">
                                        {item.sku}
                                    </TableCell>
                                    <TableCell className="py-4 text-sm text-muted-foreground">
                                        {item.location}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">{item.stockQuantity}</span>
                                            <span className="text-xs text-muted-foreground">{item.unit}</span>
                                        </div>
                                        <div className="text-[11px] text-muted-foreground mt-0.5">Min: {item.minStockAlert} {item.unit !== 'disponibles' ? item.unit : ''}</div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <Badge 
                                            variant="secondary"
                                            className={`gap-1.5 font-medium ${
                                                item.stockQuantity <= 0
                                                    ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100'
                                                    : item.isLowStock
                                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 hover:bg-amber-100'
                                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100'
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                item.stockQuantity <= 0 ? 'bg-red-600 dark:bg-red-400' :
                                                item.isLowStock ? 'bg-amber-600 dark:bg-amber-400' :
                                                'bg-emerald-600 dark:bg-emerald-400'
                                            }`}></span>
                                            {item.stockQuantity <= 0 ? 'Agotado' : item.isLowStock ? 'Bajo Stock' : 'Normal'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 text-right px-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        No hay ítems en esta categoría.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
