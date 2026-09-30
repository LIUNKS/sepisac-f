import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Download, FileText, CheckCircle2, Clock, DownloadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const kpisData = [
    { title: 'Cotizaciones Emitidas', value: '128', trend: '+15% vs mes anterior', trendType: 'success', icon: FileText },
    { title: 'Aprobadas (Éxito)', value: '95', trend: 'Tasa de conversión: 74%', trendType: 'success', icon: CheckCircle2 },
    { title: 'Pendientes de Revisión', value: '15', trend: 'Esperando respuesta', trendType: 'warning', icon: Clock },
];

const quotesData = [
    { id: 1, no: 'COT-2026-1045', client: 'Industrias Alpha S.A.', ruc: '20456789123', project: 'Mantenimiento Preventivo Faja', date: '12 Ago 2026', amount: 'S/ 4,500.00', status: 'Aprobada' },
    { id: 2, no: 'COT-2026-1046', client: 'Alimentos del Sur EIRL', ruc: '20789456123', project: 'Instalación Sistema Refrigeración', date: '22 Ago 2026', amount: 'S/ 12,850.00', status: 'Pendiente' },
    { id: 3, no: 'COT-2026-1047', client: 'Minera CobreX', ruc: '20123456789', project: 'Fabricación Piezas Metálicas', date: '25 Ago 2026', amount: 'S/ 8,200.00', status: 'Pendiente' },
    { id: 4, no: 'COT-2026-1048', client: 'Constructora Litoral', ruc: '20987654321', project: 'Mantenimiento Eléctrico Tableros', date: '26 Ago 2026', amount: 'S/ 3,100.00', status: 'Rechazada' },
];

export const CotizacionesPage = () => {
    const [activeTab, setActiveTab] = useState('Todas');

    const tabs = [
        { id: 'Todas', label: 'Todas', count: 128 },
        { id: 'Pendientes', label: 'Pendientes', count: 0 },
        { id: 'Aprobadas', label: 'Aprobadas', count: 0 },
        { id: 'Rechazadas', label: 'Rechazadas', count: 0 },
    ];

    return (
        <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpisData.map((kpi, idx) => (
                    <Card key={idx} className="border-border shadow-sm relative overflow-hidden">
                        <CardContent className="p-6">
                            <p className="text-sm font-semibold text-muted-foreground mb-2">{kpi.title}</p>
                            <h3 className="text-3xl font-bold text-foreground mb-2">{kpi.value}</h3>
                            <div className={`text-xs font-medium flex items-center gap-1.5 ${
                                kpi.trendType === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                            }`}>
                                <span>{kpi.trend}</span>
                            </div>
                            
                            <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center ${
                                idx === 0 ? 'bg-secondary text-muted-foreground' : 
                                idx === 1 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                                'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
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
                                    className={`pb-4 text-sm font-medium transition-colors border-b-2 -mb-[1px] flex items-center gap-2 ${
                                        activeTab === tab.id 
                                            ? 'border-primary text-primary' 
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab.label}
                                    {tab.id === 'Todas' && (
                                        <span className="bg-secondary text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 mb-3 h-8 text-sm">
                            <DownloadCloud className="w-4 h-4 mr-2" />
                            Exportar Datos
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent bg-secondary/20">
                                <TableHead className="text-muted-foreground font-semibold px-6">N° Cotización</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Cliente</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Proyecto / Referencia</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Fecha</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Monto Total</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Estado</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right px-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotesData.map((quote) => (
                                <TableRow key={quote.id} className="border-border/50 hover:bg-muted/50">
                                    <TableCell className="px-6 py-4 font-bold text-foreground">
                                        {quote.no}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold text-foreground">{quote.client}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">RUC: {quote.ruc}</div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{quote.project}</TableCell>
                                    <TableCell className="text-muted-foreground">{quote.date}</TableCell>
                                    <TableCell className="font-bold text-foreground">{quote.amount}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant="secondary" 
                                            className={`gap-1.5 ${
                                                quote.status === 'Aprobada' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20' :
                                                quote.status === 'Pendiente' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20' :
                                                'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20'
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                quote.status === 'Aprobada' ? 'bg-emerald-600 dark:bg-emerald-400' :
                                                quote.status === 'Pendiente' ? 'bg-amber-600 dark:bg-amber-400' :
                                                'bg-red-600 dark:bg-red-400'
                                            }`}></span>
                                            {quote.status}
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
                                            <Button variant="outline" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                                                <Download className="w-4 h-4" />
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
