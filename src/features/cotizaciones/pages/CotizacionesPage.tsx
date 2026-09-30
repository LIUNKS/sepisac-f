import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Download, FileText, CheckCircle2, Clock, DownloadCloud, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/app/store/useAuthStore';
import { getQuotations } from '../services/quotation.service';
import { ViewQuotationModal } from '../components/ViewQuotationModal';
import { EditQuotationModal } from '../components/EditQuotationModal';
import type { Quotation } from '../types';

export const CotizacionesPage = () => {
    const [activeTab, setActiveTab] = useState('Todas');
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { user } = useAuthStore();

    const { data, isLoading } = useQuery({
        queryKey: ['quotations', user?.companyId],
        queryFn: () => getQuotations(user?.companyId || '')
    });

    const quotations = data?.content || [];

    const tabs = [
        { id: 'Todas', label: `Todas (${quotations.length})`, count: quotations.length },
        { id: 'Pendientes', label: 'Pendientes', count: quotations.filter(q => q.status === 'PENDIENTE').length },
        { id: 'Aprobadas', label: 'Aprobadas', count: quotations.filter(q => q.status === 'APROBADA').length },
        { id: 'Rechazadas', label: 'Rechazadas', count: quotations.filter(q => q.status === 'RECHAZADA').length },
    ];

    const filteredQuotations = quotations.filter(q => {
        if (activeTab === 'Todas') return true;
        if (activeTab === 'Pendientes') return q.status === 'PENDIENTE';
        if (activeTab === 'Aprobadas') return q.status === 'APROBADA';
        if (activeTab === 'Rechazadas') return q.status === 'RECHAZADA';
        return true;
    });

    const totalIssued = quotations.length;
    const totalApproved = quotations.filter(q => q.status === 'APROBADA').length;
    const totalPending = quotations.filter(q => q.status === 'PENDIENTE').length;
    const conversionRate = totalIssued > 0 ? Math.round((totalApproved / totalIssued) * 100) : 0;

    const kpisData = [
        { title: 'Cotizaciones Emitidas', value: totalIssued.toString(), trend: 'Este mes', trendType: 'success', icon: FileText },
        { title: 'Aprobadas (Éxito)', value: totalApproved.toString(), trend: `Tasa de conversión: CheckCircle2 },
        { title: 'Pendientes de Revisión: Clock },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }
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
                        <div className="flex items-center gap-2 mb-3">
                            <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 h-8 text-sm">
                                <DownloadCloud className="w-4 h-4 mr-2" />
                                Exportar Datos
                            </Button>
                            <Button className="h-8 text-sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Cotización
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent bg-secondary/20">
                                <TableHead classNº Cotización</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Cliente</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Proyecto / Referencia</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Fecha</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Monto Total</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Estado</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right px-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                                                                        <TableBody>
                            {filteredQuotations.map((quote) => (
                                <TableRow key={quote.id} className="border-border/50 hover:bg-muted/50">
                                    <TableCell className="px-6 py-4 font-bold text-foreground">
                                        {quote.quotationNumber}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold text-foreground">{quote.clientName}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{quote.serviceType}</div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">-</TableCell>
                                    <TableCell className="text-muted-foreground">{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-bold text-foreground">{quote.currency} {quote.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant="secondary" 
                                            className={
                                                `gap-1.5 ${
                                                    quote.status === 'APROBADA' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20' :
                                                    quote.status === 'PENDIENTE' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20' :
                                                    'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20'
                                                }`
                                            }
                                        >
                                            <span className={
                                                `w-1.5 h-1.5 rounded-full ${
                                                    quote.status === 'APROBADA' ? 'bg-emerald-600 dark:bg-emerald-400' :
                                                    quote.status === 'PENDIENTE' ? 'bg-amber-600 dark:bg-amber-400' :
                                                    'bg-red-600 dark:bg-red-400'
                                                }`
                                            }></span>
                                            {quote.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="w-8 h-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => {
                                                    setSelectedQuotation(quote);
                                                    setIsViewModalOpen(true);
                                                }}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="w-8 h-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => {
                                                    setSelectedQuotation(quote);
                                                    setIsEditModalOpen(true);
                                                }}
                                            >
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
                    <ViewQuotationModal
                quotation={selectedQuotation}
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedQuotation(null);
                }}
            />
                    <EditQuotationModal
                quotation={selectedQuotation}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedQuotation(null);
                }}
            />
        </div>
    );
};









