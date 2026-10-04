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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, DollarSign, Receipt } from 'lucide-react';
import type { InvoiceResponseDTO } from '../types';
import { format } from 'date-fns';

interface InvoicesTableProps {
    invoices: InvoiceResponseDTO[];
    isLoading: boolean;
    onAddPayment: (invoice: InvoiceResponseDTO) => void;
    onViewPayments: (invoice: InvoiceResponseDTO) => void;
}

export const InvoicesTable = ({ invoices, isLoading, onAddPayment, onViewPayments }: InvoicesTableProps) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48 border rounded-md bg-card">
                <span className="text-muted-foreground animate-pulse">Cargando facturas...</span>
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="flex justify-center items-center h-48 border rounded-md bg-card">
                <span className="text-muted-foreground">No se encontraron facturas.</span>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDIENTE':
                return <Badge variant="outline" className="text-orange-500 border-orange-500">Pendiente</Badge>;
            case 'PARCIAL':
                return <Badge variant="outline" className="text-blue-500 border-blue-500">Parcial</Badge>;
            case 'PAGADA':
                return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Pagada</Badge>;
            case 'VENCIDA':
                return <Badge variant="destructive">Vencida</Badge>;
            case 'ANULADA':
                return <Badge variant="secondary">Anulada</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: currency || 'PEN' }).format(amount);
    };

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>N° FACTURA</TableHead>
                        <TableHead>CLIENTE / PROYECTO</TableHead>
                        <TableHead>EMISIÓN</TableHead>
                        <TableHead>VENCIMIENTO</TableHead>
                        <TableHead className="text-right">MONTO TOTAL</TableHead>
                        <TableHead className="text-right">SALDO</TableHead>
                        <TableHead className="text-center">ESTADO</TableHead>
                        <TableHead className="text-right">ACCIONES</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                            <TableCell>
                                <div className="font-semibold">{invoice.clientName}</div>
                                {invoice.projectCode && <div className="text-xs text-muted-foreground">{invoice.projectCode}</div>}
                            </TableCell>
                            <TableCell>{format(new Date(invoice.issueDate), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</TableCell>
                            <TableCell className="text-right">{formatCurrency(invoice.totalAmount, invoice.currency)}</TableCell>
                            <TableCell className="text-right font-semibold text-red-600">{formatCurrency(invoice.balanceDue, invoice.currency)}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(invoice.paymentStatus)}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onViewPayments(invoice)}>
                                            <Receipt className="mr-2 h-4 w-4" />
                                            Ver Pagos
                                        </DropdownMenuItem>
                                        {['PENDIENTE', 'PARCIAL', 'VENCIDA'].includes(invoice.paymentStatus) && (
                                            <DropdownMenuItem onClick={() => onAddPayment(invoice)}>
                                                <DollarSign className="mr-2 h-4 w-4" />
                                                Registrar Abono
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

