import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
    Eye, Pencil, Download, FileText, CheckCircle2, Clock, 
    DownloadCloud, Loader2, Plus, ChevronDown, Send, Check, X, Rocket, XCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

import { useAuthStore } from '@/app/store/useAuthStore';
import { getQuotations, getQuotationById, updateQuotationStatus } from '../services/quotation.service';
import { getProjects } from '@/features/projects/services/projectService';
import { ViewQuotationModal } from '../components/ViewQuotationModal';
import { EditQuotationModal } from '../components/EditQuotationModal';
import { CreateQuotationModal } from '../components/CreateQuotationModal';
import { CreateProjectFromQuotationModal } from '../components/CreateProjectFromQuotationModal';
import { exportQuotationsToExcel } from '../utils/exportToExcel';
import { formatServiceType } from '../utils/formatServiceType';
import { pdf } from '@react-pdf/renderer';
import { QuotationPDF } from '../components/QuotationPDF';
import { toast } from 'sonner';
import type { Quotation } from '../types';
import type { Project } from '@/features/projects/types';

export const CotizacionesPage = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('Todas');

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateQuotationStatus(id, status),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['quotations'] });
            toast.success(`Estado de la cotización actualizado a ${variables.status}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar el estado. Revisa las reglas de negocio.');
        }
    });

    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
    const [quotationForProject, setQuotationForProject] = useState<Quotation | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const { user } = useAuthStore();

    const handleDownloadPDF = async (id: string, quotationNumber: string) => {
        setDownloadingId(id);
        try {
            const fullQuotation = await getQuotationById(id);
            const blob = await pdf(<QuotationPDF quotation={fullQuotation} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = url;
            a.download = `Cotizacion_${quotationNumber}.pdf`;
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('PDF descargado exitosamente');
        } catch (error) {
            console.error('Error generating PDF', error);
            toast.error('Error al generar el PDF de la cotización');
        } finally {
            setDownloadingId(null);
        }
    };

    const { data, isLoading } = useQuery({
        queryKey: ['quotations', user?.companyId],
        queryFn: () => getQuotations(user?.companyId || ''),
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const { data: projectsData } = useQuery({
        queryKey: ['projects', user?.companyId],
        queryFn: () => getProjects(user?.companyId || ''),
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const quotations = data?.content || [];
    const projects: Project[] = projectsData?.content || [];

    const tabs = [
        { id: 'Todas', label: 'Todas', count: quotations.length },
        { id: 'Borradores', label: 'Borradores', count: quotations.filter(q => q.status === 'BORRADOR').length },
        { id: 'Enviadas', label: 'Enviadas', count: quotations.filter(q => q.status === 'ENVIADA').length },
        { id: 'Aprobadas', label: 'Aprobadas', count: quotations.filter(q => q.status === 'APROBADA').length },
        { id: 'Rechazadas', label: 'Rechazadas', count: quotations.filter(q => q.status === 'RECHAZADA').length },
    ];

    const filteredQuotations = quotations.filter(q => {
        if (activeTab === 'Todas') return true;
        if (activeTab === 'Borradores') return q.status === 'BORRADOR';
        if (activeTab === 'Enviadas') return q.status === 'ENVIADA';
        if (activeTab === 'Aprobadas') return q.status === 'APROBADA';
        if (activeTab === 'Rechazadas') return q.status === 'RECHAZADA';
        return true;
    });

    const totalIssued = quotations.length;
    const totalApproved = quotations.filter(q => q.status === 'APROBADA').length;
    const totalPending = quotations.filter(q => q.status === 'BORRADOR').length;
    const conversionRate = totalIssued > 0 ? Math.round((totalApproved / totalIssued) * 100) : 0;

    const kpisData = [
        { title: 'Cotizaciones Emitidas', value: totalIssued.toString(), trend: 'Este mes', trendType: 'success', icon: FileText },
        { title: 'Aprobadas (Éxito)', value: totalApproved.toString(), trend: `Tasa de conversión: ${conversionRate}%`, trendType: 'success', icon: CheckCircle2 },
        { title: 'Borradores de Revisión', value: totalPending.toString(), trend: 'Por gestionar', trendType: 'warning', icon: Clock },
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
                                    <span>{tab.label}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-secondary text-muted-foreground'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 h-8 text-sm" onClick={() => {
                                if (filteredQuotations) {
                                    exportQuotationsToExcel(filteredQuotations);
                                }
                            }}>
                                <DownloadCloud className="w-4 h-4 mr-2" />
                                Exportar Datos
                            </Button>
                            <Button className="h-8 text-sm font-semibold shadow-sm" onClick={() => setIsCreateModalOpen(true)}>
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
                                <TableHead className="text-muted-foreground font-semibold px-6">Nº Cotización</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Cliente</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Proyecto / Referencia</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Fecha</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Monto Total</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Estado</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right px-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQuotations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No hay cotizaciones para mostrar en este estado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredQuotations.map((quote) => {
                                    const linkedProject = projects.find(p => p.quotationId === quote.id);

                                    return (
                                        <TableRow key={quote.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                                            <TableCell className="px-6 py-4 font-bold text-foreground">
                                                {quote.quotationNumber}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-foreground">{quote.clientName}</div>
                                            </TableCell>
                                            <TableCell>
                                                {linkedProject ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground text-sm flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block shrink-0" title="Proyecto vinculado en ejecución" />
                                                            {linkedProject.title}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground mt-0.5">
                                                            {linkedProject.code} • {formatServiceType(quote.serviceType)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground text-sm">
                                                            {formatServiceType(quote.serviceType)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground mt-0.5">
                                                            Sin proyecto vinculado
                                                        </span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-bold text-foreground">{quote.currency} {quote.totalAmount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            type="button"
                                                            disabled={quote.status === 'APROBADA' || quote.status === 'RECHAZADA'}
                                                            className="focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full inline-flex"
                                                            title={
                                                                quote.status === 'BORRADOR' ? 'Clic para enviar propuesta al cliente' :
                                                                quote.status === 'ENVIADA' ? 'Clic para Aprobar o Rechazar' :
                                                                'Estado definitivo'
                                                            }
                                                        >
                                                            <Badge 
                                                                variant="secondary" 
                                                                className={
                                                                    `gap-1.5 transition-all ${
                                                                        (quote.status === 'BORRADOR' || quote.status === 'ENVIADA') ? 'cursor-pointer hover:ring-2 hover:ring-primary/20 hover:opacity-90' : 'cursor-default'
                                                                    } ${
                                                                        quote.status === 'APROBADA' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                                        quote.status === 'BORRADOR' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                                                                        quote.status === 'ENVIADA' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                                                                        'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                                                    }`
                                                                }
                                                            >
                                                                <span className={
                                                                    `w-1.5 h-1.5 rounded-full ${
                                                                        quote.status === 'APROBADA' ? 'bg-emerald-600 dark:bg-emerald-400' :
                                                                        quote.status === 'BORRADOR' ? 'bg-amber-600 dark:bg-amber-400' :
                                                                        quote.status === 'ENVIADA' ? 'bg-blue-600 dark:bg-blue-400' :
                                                                        'bg-red-600 dark:bg-red-400'
                                                                    }`
                                                                }></span>
                                                                {quote.status}
                                                                {(quote.status === 'BORRADOR' || quote.status === 'ENVIADA') && (
                                                                    <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
                                                                )}
                                                            </Badge>
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" className="w-56">
                                                        {quote.status === 'BORRADOR' && (
                                                            <DropdownMenuItem 
                                                                className="cursor-pointer text-blue-600 focus:text-blue-700 font-medium"
                                                                onClick={() => statusMutation.mutate({ id: quote.id, status: 'ENVIADA' })}
                                                            >
                                                                <Send className="w-3.5 h-3.5 mr-2" />
                                                                Marcar como ENVIADA al Cliente
                                                            </DropdownMenuItem>
                                                        )}
                                                        {quote.status === 'ENVIADA' && (
                                                            <>
                                                                <DropdownMenuItem 
                                                                    className="cursor-pointer text-emerald-600 focus:text-emerald-700 font-medium"
                                                                    onClick={() => statusMutation.mutate({ id: quote.id, status: 'APROBADA' })}
                                                                >
                                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                                                                    Marcar como APROBADA
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    className="cursor-pointer text-red-600 focus:text-red-700 font-medium"
                                                                    onClick={() => statusMutation.mutate({ id: quote.id, status: 'RECHAZADA' })}
                                                                >
                                                                    <XCircle className="w-3.5 h-3.5 mr-2" />
                                                                    Marcar como RECHAZADA
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                            <TableCell className="px-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Quick contextual action buttons */}
                                                    {quote.status === 'BORRADOR' && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="icon" 
                                                            className="w-8 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 border-blue-200 dark:border-blue-900/50"
                                                            title="Enviar Cotización al Cliente (Pasa a ENVIADA)"
                                                            onClick={() => statusMutation.mutate({ id: quote.id, status: 'ENVIADA' })}
                                                            disabled={statusMutation.isPending}
                                                        >
                                                            <Send className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}

                                                    {quote.status === 'ENVIADA' && (
                                                        <>
                                                            <Button 
                                                                variant="outline" 
                                                                size="icon" 
                                                                className="w-8 h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/50"
                                                                title="Aprobar Cotización"
                                                                onClick={() => statusMutation.mutate({ id: quote.id, status: 'APROBADA' })}
                                                                disabled={statusMutation.isPending}
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="outline" 
                                                                size="icon" 
                                                                className="w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200 dark:border-red-900/50"
                                                                title="Rechazar Cotización"
                                                                onClick={() => statusMutation.mutate({ id: quote.id, status: 'RECHAZADA' })}
                                                                disabled={statusMutation.isPending}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}

                                                    {quote.status === 'APROBADA' && !linkedProject && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="icon" 
                                                            className="w-8 h-8 text-primary hover:text-primary hover:bg-primary/10 border-primary/30"
                                                            title="Crear Proyecto Operativo desde esta Cotización"
                                                            onClick={() => {
                                                                setQuotationForProject(quote);
                                                                setIsConvertModalOpen(true);
                                                            }}
                                                        >
                                                            <Rocket className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}

                                                    <Button 
                                                        variant="outline" 
                                                        size="icon" 
                                                        className="w-8 h-8 text-muted-foreground hover:text-foreground"
                                                        title="Ver Detalle"
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
                                                        title="Editar Cotización"
                                                        onClick={() => {
                                                            setSelectedQuotation(quote);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="icon" 
                                                        className="w-8 h-8 text-muted-foreground hover:text-foreground" 
                                                        title="Descargar PDF"
                                                        onClick={() => handleDownloadPDF(quote.id, quote.quotationNumber)} 
                                                        disabled={downloadingId === quote.id}
                                                    >
                                                        {downloadingId === quote.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
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

            <CreateQuotationModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <CreateProjectFromQuotationModal
                quotation={quotationForProject}
                isOpen={isConvertModalOpen}
                onClose={() => {
                    setIsConvertModalOpen(false);
                    setQuotationForProject(null);
                }}
            />
        </div>
    );
};
