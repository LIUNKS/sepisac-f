import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Building2, Calendar, ClipboardList, Info, FileText, 
    CheckCircle, Download, Loader2, Send, CheckCircle2, XCircle, Rocket 
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pdf } from '@react-pdf/renderer';
import { QuotationPDF } from './QuotationPDF';
import { toast } from 'sonner';
import type { Quotation } from '../types';
import { formatServiceType } from '../utils/formatServiceType';
import { useState, useEffect } from 'react';
import { CreateProjectFromQuotationModal } from './CreateProjectFromQuotationModal';
import { updateQuotationStatus } from '../services/quotation.service';

interface ViewQuotationModalProps {
    quotation: Quotation | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ViewQuotationModal = ({ quotation, isOpen, onClose }: ViewQuotationModalProps) => {
    const queryClient = useQueryClient();
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);

    useEffect(() => {
        if (quotation) {
            setCurrentStatus(quotation.status);
        }
    }, [quotation, isOpen]);

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateQuotationStatus(id, status),
        onSuccess: (_data, variables) => {
            setCurrentStatus(variables.status);
            queryClient.invalidateQueries({ queryKey: ['quotations'] });
            toast.success(`Estado de la cotización actualizado a ${variables.status}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar el estado de la cotización.');
        }
    });

    const handleDownloadPDF = async () => {
        if (!quotation) return;
        setIsGeneratingPDF(true);
        try {
            const blob = await pdf(<QuotationPDF quotation={quotation} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = url;
            a.download = `Cotizacion_${quotation.quotationNumber}.pdf`;
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('PDF generado exitosamente');
        } catch (error) {
            console.error('Error generating PDF', error);
            toast.error('Error al generar el PDF');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    if (!quotation) return null;

    const displayStatus = currentStatus || quotation.status;

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'No definida';
        return new Intl.DateTimeFormat('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateStr));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-card border-border shadow-lg">
                <DialogHeader className="border-b border-border pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <ClipboardList className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-foreground">
                                    Cotización {quotation.quotationNumber}
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1 font-medium">
                                    {formatServiceType(quotation.serviceType)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadPDF}
                                disabled={isGeneratingPDF}
                                className="h-8 text-xs font-medium"
                            >
                                {isGeneratingPDF ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                        PDF...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-3.5 h-3.5 mr-1.5" />
                                        Descargar PDF
                                    </>
                                )}
                            </Button>
                            <Badge 
                                variant="secondary" 
                                className={
                                    displayStatus === 'APROBADA' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                    displayStatus === 'BORRADOR' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                                    displayStatus === 'ENVIADA' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                                    'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                }
                            >
                                {displayStatus}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6 py-4">
                    <div className="space-y-6">
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Info className="w-4 h-4 text-primary" />
                                Información General
                            </h4>
                            <div className="space-y-3 bg-secondary/20 p-4 rounded-lg border border-border/50">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Cliente</p>
                                    <p className="text-sm font-medium flex items-center gap-2 text-foreground">
                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                        {quotation.clientName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Tipo de Servicio</p>
                                    <p className="text-sm font-medium flex items-center gap-2 text-foreground">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                        {formatServiceType(quotation.serviceType)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Calendar className="w-4 h-4 text-primary" />
                                Fechas de Registro
                            </h4>
                            <div className="space-y-3 bg-secondary/20 p-4 rounded-lg border border-border/50">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Fecha de Creación</p>
                                    <p className="text-sm font-medium text-foreground">{formatDate(quotation.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <FileText className="w-4 h-4 text-primary" />
                                Resumen Financiero
                            </h4>
                            <div className="space-y-2.5 bg-secondary/20 p-4 rounded-lg border border-border/50">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground font-medium">Moneda</p>
                                    <p className="text-sm font-semibold text-foreground">{quotation.currency}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground font-medium">Tipo de Cambio</p>
                                    <p className="text-sm font-medium text-foreground">{quotation.exchangeRate.toFixed(4)}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground font-medium">Subtotal Costos</p>
                                    <p className="text-sm font-medium text-foreground">{quotation.currency} {quotation.subtotalCosts.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground font-medium">Margen Ganancia</p>
                                    <p className="text-sm font-medium text-foreground">{quotation.profitMarginPercentage.toFixed(2)}%</p>
                                </div>
                                <div className="pt-2 mt-2 border-t border-border/50 flex justify-between items-center">
                                    <p className="text-xs font-bold text-foreground">Monto Total</p>
                                    <p className="text-lg font-bold text-primary">{quotation.currency} {quotation.totalAmount.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                Desglose de Insumos
                            </h4>
                            <div className="space-y-3 bg-secondary/20 p-4 rounded-lg border border-border/50">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground font-medium">Cant. Detalles / Insumos</p>
                                    <p className="text-sm font-medium text-foreground">{quotation.detailsCount}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground font-medium">Cant. Requerimientos Laborales</p>
                                    <p className="text-sm font-medium text-foreground">{quotation.laborCount}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Transition Control Actions */}
                        <div className="pt-4 border-t border-border/50 space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Flujo de Estado Comercial
                            </p>

                            {displayStatus === 'BORRADOR' && (
                                <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 shadow-sm"
                                    onClick={() => statusMutation.mutate({ id: quotation.id, status: 'ENVIADA' })}
                                    disabled={statusMutation.isPending}
                                >
                                    {statusMutation.isPending ? (
                                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                    ) : (
                                        <Send className="w-3.5 h-3.5 mr-2" />
                                    )}
                                    Marcar como Enviada al Cliente
                                </Button>
                            )}

                            {displayStatus === 'ENVIADA' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 shadow-sm"
                                        onClick={() => statusMutation.mutate({ id: quotation.id, status: 'APROBADA' })}
                                        disabled={statusMutation.isPending}
                                    >
                                        {statusMutation.isPending ? (
                                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                        )}
                                        Aprobar Cotización
                                    </Button>
                                    <Button 
                                        variant="destructive"
                                        className="w-full font-semibold text-xs h-9 shadow-sm"
                                        onClick={() => statusMutation.mutate({ id: quotation.id, status: 'RECHAZADA' })}
                                        disabled={statusMutation.isPending}
                                    >
                                        {statusMutation.isPending ? (
                                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                        ) : (
                                            <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                        )}
                                        Rechazar
                                    </Button>
                                </div>
                            )}

                            {displayStatus === 'APROBADA' && (
                                <Button 
                                    className="w-full font-semibold text-xs h-9 shadow-sm" 
                                    onClick={() => setIsConvertModalOpen(true)}
                                >
                                    <Rocket className="w-3.5 h-3.5 mr-2" />
                                    Convertir a Proyecto Operativo
                                </Button>
                            )}

                            {displayStatus === 'RECHAZADA' && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/30 text-center text-xs text-red-600 dark:text-red-400 font-medium">
                                    Esta cotización fue rechazada por el cliente (Estado definitivo).
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>

            <CreateProjectFromQuotationModal
                quotation={quotation}
                isOpen={isConvertModalOpen}
                onClose={() => setIsConvertModalOpen(false)}
                onSuccess={() => {
                    setIsConvertModalOpen(false);
                    onClose();
                }}
            />
        </Dialog>
    );
};
