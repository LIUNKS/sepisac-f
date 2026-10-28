import { useState } from 'react';
import { PreviewAutoGenerateModal } from './PreviewAutoGenerateModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Settings, Ban, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { usePurchaseOrders, useCancelPurchaseOrder, useReceivePurchaseOrder } from '../hooks/usePurchaseOrders';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

interface ConfirmAction {
    type: 'RECEIVE' | 'CANCEL';
    orderId: string;
    orderNumber: string;
}

export const PurchaseOrdersTab = () => {
    const [page] = useState(0);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

    const { data, isLoading } = usePurchaseOrders({ page, size: 20, sort: 'createdAt,desc' });
    const cancelMutation = useCancelPurchaseOrder();
    const receiveMutation = useReceivePurchaseOrder();

    const orders = data?.content || [];

    const handleConfirmAction = () => {
        if (!confirmAction) return;

        if (confirmAction.type === 'RECEIVE') {
            receiveMutation.mutate(confirmAction.orderId, {
                onSettled: () => setConfirmAction(null)
            });
        } else {
            cancelMutation.mutate(confirmAction.orderId, {
                onSettled: () => setConfirmAction(null)
            });
        }
    };

    const isActionPending = receiveMutation.isPending || cancelMutation.isPending;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border border-border/50">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Órdenes de Compra
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Gestiona las compras a proveedores y la reposición de stock.
                    </p>
                </div>
                <Button onClick={() => setIsPreviewModalOpen(true)} variant="default">
                    <Settings className="w-4 h-4 mr-2" />
                    Autogenerar Órdenes
                </Button>
            </div>

            <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead>N° ORDEN</TableHead>
                            <TableHead>FECHA</TableHead>
                            <TableHead>PROVEEDOR</TableHead>
                            <TableHead>TOTAL</TableHead>
                            <TableHead>ESTADO</TableHead>
                            <TableHead className="text-right">ACCIONES</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    No hay órdenes de compra registradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium font-mono text-sm">{order.orderNumber}</TableCell>
                                    <TableCell>
                                        {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-sm">{order.supplierName}</p>
                                            <p className="text-xs text-muted-foreground">RUC: {order.supplierRuc}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-primary">
                                        {order.currency === 'PEN' ? 'S/' : '$'} {order.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            order.status === 'COMPLETADA' || order.status === 'RECIBIDA' ? 'default' :
                                            order.status === 'CANCELADA' ? 'destructive' :
                                            'outline'
                                        } className={order.status === 'PENDIENTE' ? 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30' : ''}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {order.status === 'PENDIENTE' && (
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" 
                                                    onClick={() => setConfirmAction({
                                                        type: 'RECEIVE',
                                                        orderId: order.id,
                                                        orderNumber: order.orderNumber
                                                    })}
                                                    disabled={isActionPending}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Recibir
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="text-destructive hover:bg-destructive/10" 
                                                    onClick={() => setConfirmAction({
                                                        type: 'CANCEL',
                                                        orderId: order.id,
                                                        orderNumber: order.orderNumber
                                                    })}
                                                    disabled={isActionPending}
                                                >
                                                    <Ban className="w-4 h-4 mr-1.5" /> Cancelar
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <PreviewAutoGenerateModal 
                isOpen={isPreviewModalOpen} 
                onClose={() => setIsPreviewModalOpen(false)} 
            />

            {/* Custom Confirmation Modal */}
            <Dialog open={Boolean(confirmAction)} onOpenChange={(open) => !open && !isActionPending && setConfirmAction(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                            confirmAction?.type === 'RECEIVE' 
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                        }`}>
                            {confirmAction?.type === 'RECEIVE' ? (
                                <CheckCircle2 className="w-6 h-6" />
                            ) : (
                                <AlertTriangle className="w-6 h-6" />
                            )}
                        </div>
                        <DialogTitle className="text-center text-lg">
                            {confirmAction?.type === 'RECEIVE' ? '¿Recibir Orden de Compra?' : '¿Cancelar Orden de Compra?'}
                        </DialogTitle>
                        <DialogDescription className="text-center pt-2 text-sm">
                            {confirmAction?.type === 'RECEIVE' ? (
                                <>
                                    Se registrará la entrada de los materiales de la orden <strong>{confirmAction?.orderNumber}</strong>. El inventario se actualizará automáticamente y se generarán los movimientos en el Kardex.
                                </>
                            ) : (
                                <>
                                    ¿Estás seguro de cancelar la orden <strong>{confirmAction?.orderNumber}</strong>? Esta acción no se puede deshacer.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-4 flex flex-row gap-2 justify-center sm:justify-center">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConfirmAction(null)}
                            disabled={isActionPending}
                            className="w-full"
                        >
                            Volver
                        </Button>
                        <Button
                            type="button"
                            variant={confirmAction?.type === 'RECEIVE' ? 'default' : 'destructive'}
                            onClick={handleConfirmAction}
                            disabled={isActionPending}
                            className="w-full"
                        >
                            {isActionPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Procesando...
                                </>
                            ) : confirmAction?.type === 'RECEIVE' ? (
                                'Sí, recibir materiales'
                            ) : (
                                'Sí, cancelar orden'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
