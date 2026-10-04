import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { paymentSchema, type PaymentFormValues } from '../schemas';
import { useRegisterPayment, useInvoicePayments } from '../api';
import type { InvoiceResponseDTO } from '../types';
import { format } from 'date-fns';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: InvoiceResponseDTO | null;
    mode: 'add' | 'view';
}

export const PaymentModal = ({ isOpen, onClose, invoice, mode }: PaymentModalProps) => {
    const { mutate: registerPayment, isPending } = useRegisterPayment();
    const { data: payments, isLoading: isLoadingPayments } = useInvoicePayments(
        invoice?.id || '',
        isOpen && mode === 'view' && !!invoice
    );

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amountPaid: 0,
            paymentMethod: 'TRANSFERENCIA',
            referenceCode: '',
        },
    });

    const onSubmit = (data: PaymentFormValues) => {
        if (!invoice) return;
        registerPayment(
            { id: invoice.id, payload: data },
            { onSuccess: () => onClose() }
        );
    };

    if (!invoice) return null;

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: currency || 'PEN' }).format(amount);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                form.reset();
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'add' ? `Registrar Abono - ${invoice.invoiceNumber}` : `Historial de Pagos - ${invoice.invoiceNumber}`}
                    </DialogTitle>
                    <DialogDescription>
                        Cliente: {invoice.clientName} | Saldo pendiente: <span className="font-bold text-red-600">{formatCurrency(invoice.balanceDue, invoice.currency)}</span>
                    </DialogDescription>
                </DialogHeader>

                {mode === 'view' ? (
                    <div className="space-y-4">
                        {isLoadingPayments ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : payments?.length === 0 ? (
                            <p className="text-center text-muted-foreground p-4">No hay pagos registrados para esta factura.</p>
                        ) : (
                            <div className="max-h-[300px] overflow-y-auto space-y-2">
                                {payments?.map((payment) => (
                                    <div key={payment.id} className="p-3 border rounded-md bg-muted/30 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{formatCurrency(payment.amountPaid, payment.currency || invoice.currency)}</p>
                                            <p className="text-xs text-muted-foreground">{payment.paymentMethod} {payment.referenceCode ? `- ${payment.referenceCode}` : ''}</p>
                                        </div>
                                        <div className="text-sm text-right text-muted-foreground">
                                            {format(new Date(payment.paymentDate), 'dd/MM/yyyy HH:mm')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={onClose}>Cerrar</Button>
                        </div>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="amountPaid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto a Pagar ({invoice.currency})</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" max={invoice.balanceDue} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Método de Pago</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione método" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                                                <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                                                <SelectItem value="DEPOSITO">Depósito</SelectItem>
                                                <SelectItem value="TARJETA">Tarjeta</SelectItem>
                                                <SelectItem value="CHEQUE">Cheque</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="referenceCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código de Referencia (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. N° Operación" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Registrar Pago
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
};
