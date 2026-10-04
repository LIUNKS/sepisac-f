import { useState } from 'react';
import { PreviewAutoGenerateModal } from './PreviewAutoGenerateModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Settings, Ban, FileText, CheckCircle2 } from 'lucide-react';
import { usePurchaseOrders, useCancelPurchaseOrder, useReceivePurchaseOrder } from '../hooks/usePurchaseOrders';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

export const PurchaseOrdersTab = () => {
    const [page] = useState(0);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const { data, isLoading } = usePurchaseOrders({ page, size: 20, sort: 'createdAt,desc' });
    const cancelMutation = useCancelPurchaseOrder();
    const receiveMutation = useReceivePurchaseOrder();

    const orders = data?.content || [];

    const handleCancel = (id: string) => {
        if (window.confirm('¿Está seguro de cancelar esta orden de compra?')) {
            cancelMutation.mutate(id);
        }
    };

    
    const handleReceive = (id: string) => {
        if (window.confirm('¿Está seguro de recibir los materiales de esta orden? Esto actualizará el stock e ingresará los movimientos.')) {
            receiveMutation.mutate(id);
        }
    };

    const handleAutoGen = () => {
        setIsPreviewModalOpen(true);
    };

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
                <Button onClick={handleAutoGen}  variant="default">
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
                                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
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
                                            order.status === 'COMPLETADA' ? 'default' :
                                            order.status === 'CANCELADA' ? 'destructive' :
                                            'outline'
                                        } className={order.status === 'PENDIENTE' ? 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30' : ''}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {order.status === 'PENDIENTE' && (
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleReceive(order.id)} disabled={receiveMutation.isPending}>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Recibir
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleCancel(order.id)} disabled={cancelMutation.isPending}>
                                                    <Ban className="w-4 h-4 mr-2" /> Cancelar
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
        </div>
    );
};
