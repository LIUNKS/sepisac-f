import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, DownloadCloud, Archive, AlertTriangle, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const kpisData = [
    { title: 'Total de Artículos', value: '1,248', trend: '+12 este mes', trendType: 'success', icon: Archive, alert: false },
    { title: 'Alertas de Stock', value: '3', trend: 'Requieren reabastecimiento', trendType: 'warning', icon: AlertTriangle, alert: true },
    { title: 'Valor del Inventario', value: 'S/ 45,300', trend: '+2.4% vs mes anterior', trendType: 'success', icon: CircleDollarSign, alert: false },
];

const inventoryData = [
    { id: 1, name: 'Taladro Percutor Bosch', category: 'Perforación', code: 'HER-042', location: 'Almacén A - Estante 2', stock: '1', unit: 'disponibles', minStock: 3, status: 'Bajo Stock' },
    { id: 2, name: 'Esmeril Angular 7"', category: 'Corte', code: 'HER-089', location: 'Almacén A - Estante 4', stock: '0', unit: 'disponibles', minStock: 2, status: 'Agotado' },
    { id: 3, name: 'Casco de Seguridad EPP', category: 'EPP', code: 'EPP-005', location: 'Almacén B - Casilleros', stock: '2', unit: 'disponibles', minStock: 10, status: 'Bajo Stock' },
    { id: 4, name: 'Cable Eléctrico 12 AWG THW', category: 'Consumibles / Eléctrico', code: 'CON-112', location: 'Almacén C - Bobinas', stock: '450', unit: 'm', minStock: 100, status: 'Normal' },
];

export const InventarioPage = () => {
    const [activeTab, setActiveTab] = useState('Alertas');

    const tabs = [
        { id: 'Todos', label: 'Todos (1,248)', showBadge: false },
        { id: 'Alertas', label: 'Alertas', showBadge: true, count: 3 },
        { id: 'Herramientas', label: 'Herramientas', showBadge: false },
        { id: 'Consumibles', label: 'Consumibles', showBadge: false },
        { id: 'EPP', label: 'EPP', showBadge: false },
    ];

    return (
        <div className="space-y-6">
            
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
                        <div className="flex gap-6">
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
                                    {tab.showBadge && (
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
                            {inventoryData.map((item) => (
                                <TableRow key={item.id} className="border-border/50 hover:bg-muted/50">
                                    <TableCell className="px-6 py-4">
                                        <div className="font-semibold text-foreground">{item.name}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{item.category}</div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{item.code}</TableCell>
                                    <TableCell className="text-muted-foreground">{item.location}</TableCell>
                                    <TableCell>
                                        <div className={`font-bold text-sm ${
                                            item.status === 'Normal' ? 'text-emerald-600 dark:text-emerald-400' :
                                            item.status === 'Bajo Stock' ? 'text-amber-600 dark:text-amber-400' :
                                            'text-red-600 dark:text-red-400'
                                        }`}>
                                            {item.stock} <span className="font-normal">{item.unit}</span>
                                        </div>
                                        <div className="text-[11px] text-muted-foreground mt-0.5">Min: {item.minStock} {item.unit !== 'disponibles' ? item.unit : ''}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant="secondary" 
                                            className={`gap-1.5 ${
                                                item.status === 'Normal' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20' :
                                                item.status === 'Bajo Stock' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20' :
                                                'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20'
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                item.status === 'Normal' ? 'bg-emerald-600 dark:bg-emerald-400' :
                                                item.status === 'Bajo Stock' ? 'bg-amber-600 dark:bg-amber-400' :
                                                'bg-red-600 dark:bg-red-400'
                                            }`}></span>
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
