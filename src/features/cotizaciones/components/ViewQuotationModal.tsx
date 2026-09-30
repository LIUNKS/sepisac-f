import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, ClipboardList, Info, FileText, CheckCircle, Download, Loader2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { QuotationPDF } from './QuotationPDF';
import { toast } from 'sonner';
import type { Quotation } from '../types';
import { useState } from 'react';
import { CreateProjectFromQuotationModal } from './CreateProjectFromQuotationModal';

interface ViewQuotationModalProps {
    quotation: Quotation | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ViewQuotationModal = ({ quotation, isOpen, onClose }: ViewQuotationModalProps) => {
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl bg-card border-border shadow-lg">
                <DialogHeader className="border-b border-border pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-foreground">
                                    {quotation.quotationNumber}
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1 font-medium">
                                    {quotation.serviceType}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                                {isGeneratingPDF ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                PDF
                            </Button>
                            <Badge 
                                variant="secondary" 
                                className={
                                    quotation.status === 'APROBADA' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                    quotation.status === 'PENDIENTE' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                                    quotation.status === 'ENVIADA' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                                    'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                }
                            >
                                {quotation.status}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6 py-4">
                    <div className="space-y-6">
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Info className="w-4 h-4 text-primary" />
                                Información del Cliente
                            </h4>
                            <div className="space-y-3 bg-secondary/20 p-4 rounded-lg border border-border/50">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Empresa Operadora</p>
                                    <p className="text-sm font-medium flex items-center gap-2 text-foreground">
                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                        {quotation.companyName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Cliente Solicitante</p>
                                    <p className="text-sm font-medium flex items-center gap-2 text-foreground">
                                        {quotation.clientName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                <Calendar className="w-4 h-4 text-primary" />
                                Cronología
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
                                <ClipboardList className="w-4 h-4 text-primary" />
                                Detalles Financieros
                            </h4>
                            <div className="space-y-3 bg-secondary/20 p-4 rounded-lg border border-border/50">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground font-medium">Subtotal de Costos</p>
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

                        {quotation.status === 'APROBADA' && (
                            <div className="pt-4 border-t border-border/50">
                                <Button className="w-full" onClick={() => setIsConvertModalOpen(true)}>
                                    Convertir a Proyecto
                                </Button>
                            </div>
                        )}
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
