import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
    MoreHorizontal, 
    DollarSign, 
    Receipt, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    Ban, 
    Loader2, 
    FileText,
    Calendar
} from 'lucide-react';
import type { InvoiceResponseDTO } from '../types';
import { useCancelInvoice } from '../api';

interface InvoicesTableProps {
    invoices: InvoiceResponseDTO[];
    isLoading: boolean;
    onAddPayment: (invoice: InvoiceResponseDTO) => void;
    onViewPayments: (invoice: InvoiceResponseDTO) => void;
}

export const InvoicesTable = ({ invoices, isLoading, onAddPayment, onViewPayments }: InvoicesTableProps) => {
    const { mutate: cancelInvoice, isPending: isCancelling } = useCancelInvoice();
    const [invoiceToCancel, setInvoiceToCancel] = useState<InvoiceResponseDTO | null>(null);
    const [cancelReason, setCancelReason] = useState('');

    const handleConfirmCancel = () => {
        if (!invoiceToCancel) return;
        cancelInvoice(
            { id: invoiceToCancel.id, reason: cancelReason.trim() || 'Anulación comercial solicitada por administración' },
            {
                onSettled: () => {
                    setInvoiceToCancel(null);
                    setCancelReason('');
                }
            }
        );
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            const [year, month, day] = dateStr.split('T')[0].split('-');
            if (year && month && day) {
                return `${day}/${month}/${year}`;
            }
            return dateStr;
        } catch {
            return dateStr;
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('es-PE', { 
            style: 'currency', 
            currency: currency || 'PEN' 
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <span className="text-muted-foreground animate-pulse text-sm">Cargando facturas y cuentas por cobrar...</span>
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-48 p-6 text-center">
                <Receipt className="w-10 h-10 text-muted-foreground opacity-30 mb-2" />
                <span className="text-foreground font-medium">No se encontraron facturas</span>
                <span className="text-xs text-muted-foreground mt-1">
                    No hay comprobantes de pago registrados en este estado o filtro de búsqueda.
                </span>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAGADA':
                return (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium text-xs gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Pagada
                    </Badge>
                );
            case 'PARCIAL':
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium text-xs gap-1">
                        <Clock className="w-3 h-3" /> Pago Parcial
                    </Badge>
                );
            case 'PENDIENTE':
                return (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium text-xs gap-1">
                        <Clock className="w-3 h-3" /> Pendiente
                    </Badge>
                );
            case 'VENCIDA':
                return (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-medium text-xs gap-1">
                        <AlertTriangle className="w-3 h-3" /> Vencida
                    </Badge>
                );
            case 'ANULADA':
                return (
                    <Badge variant="outline" className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 font-medium text-xs gap-1">
                        <Ban className="w-3 h-3" /> Anulada
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-secondary/20 hover:bg-transparent border-border/50">
                            <TableHead className="font-semibold text-muted-foreground px-6">N° Factura</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Cliente / Proyecto</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Emisión</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Vencimiento</TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-right">Monto Total</TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-right">Saldo Por Cobrar</TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-center">Estado</TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-right px-6">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => {
                            const canCancel = invoice.paymentStatus !== 'ANULADA' && invoice.totalPaid === 0;

                            return (
                                <TableRow key={invoice.id} className="border-border/50 hover:bg-muted/50">
                                    <TableCell className="px-6 py-4 font-mono font-bold text-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-primary opacity-70" />
                                            <span>{invoice.invoiceNumber}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold text-foreground">{invoice.clientName}</div>
                                        <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                            {invoice.projectCode && <span>{invoice.projectCode}</span>}
                                            {invoice.projectCode && invoice.quotationNumber && <span>•</span>}
                                            {invoice.quotationNumber && <span>Cot: {invoice.quotationNumber}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 opacity-60" />
                                            {formatDate(invoice.issueDate)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 opacity-60" />
                                            {formatDate(invoice.dueDate)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-foreground">
                                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {invoice.balanceDue > 0 ? (
                                            <span className="text-destructive">
                                                {formatCurrency(invoice.balanceDue, invoice.currency)}
                                            </span>
                                        ) : (
                                            <span className="text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(0, invoice.currency)}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(invoice.paymentStatus)}
                                    </TableCell>
                                    <TableCell className="text-right px-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => onViewPayments(invoice)}>
                                                    <Receipt className="mr-2 h-4 w-4 text-primary" />
                                                    Ver Historial Pagos
                                                </DropdownMenuItem>

                                                {['PENDIENTE', 'PARCIAL', 'VENCIDA'].includes(invoice.paymentStatus) && (
                                                    <DropdownMenuItem onClick={() => onAddPayment(invoice)}>
                                                        <DollarSign className="mr-2 h-4 w-4 text-emerald-500" />
                                                        Registrar Abono
                                                    </DropdownMenuItem>
                                                )}

                                                {canCancel && (
                                                    <DropdownMenuItem 
                                                        onClick={() => {
                                                            setInvoiceToCancel(invoice);
                                                            setCancelReason('');
                                                        }}
                                                        className="text-destructive focus:text-destructive mt-1 border-t"
                                                    >
                                                        <Ban className="mr-2 h-4 w-4" />
                                                        Anular Factura
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Custom Shadcn Dialog Confirmation for Invoice Cancellation */}
            <Dialog open={!!invoiceToCancel} onOpenChange={(open) => !open && setInvoiceToCancel(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 text-destructive mb-2">
                            <div className="p-2.5 rounded-full bg-destructive/10">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                            </div>
                            <DialogTitle className="text-destructive">Anular Factura Emitida</DialogTitle>
                        </div>
                        <DialogDescription>
                            ¿Estás seguro de que deseas anular la factura{' '}
                            <span className="font-semibold text-foreground">{invoiceToCancel?.invoiceNumber}</span> de{' '}
                            <span className="font-semibold text-foreground">{invoiceToCancel?.clientName}</span>?
                            Esta acción cancelará el comprobante comercialmente y no permitirá registrar abonos.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2">
                        <label className="text-xs font-medium text-foreground block mb-1.5">
                            Motivo de la anulación (opcional):
                        </label>
                        <Input
                            placeholder="Ej. Error en RUC del cliente, rescisión..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="text-sm"
                        />
                    </div>

                    <DialogFooter className="mt-4 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setInvoiceToCancel(null)}
                            disabled={isCancelling}
                        >
                            Volver
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmCancel}
                            disabled={isCancelling}
                        >
                            {isCancelling ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Anulando...
                                </>
                            ) : (
                                'Sí, anular factura'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
