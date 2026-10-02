import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePreviewAutoGenerateOrders, useAutoGenerateOrders } from "../hooks/usePurchaseOrders";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Loader2, Package, ShoppingCart } from "lucide-react";
import { useEffect } from "react";

interface PreviewAutoGenerateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PreviewAutoGenerateModal = ({ isOpen, onClose }: PreviewAutoGenerateModalProps) => {
    const { user } = useAuthStore();
    const { data: previewData, isFetching, refetch } = usePreviewAutoGenerateOrders(user?.companyId);
    const { mutate: confirmGenerate, isPending: isGenerating } = useAutoGenerateOrders();

    useEffect(() => {
        if (isOpen) {
            refetch();
        }
    }, [isOpen, refetch]);

    const handleConfirm = () => {
        confirmGenerate(user?.companyId, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isGenerating && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        Previsualización de Órdenes a Autogenerar
                    </DialogTitle>
                    <DialogDescription>
                        Se calcularon las siguientes órdenes de compra para abastecer los ítems en estado crítico o agotado.
                        Revisa los detalles antes de confirmarlas.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden min-h-0 border rounded-md mt-4">
                    <ScrollArea className="h-[400px]">
                        {isFetching ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                <p>Calculando órdenes necesarias...</p>
                            </div>
                        ) : previewData && previewData.length > 0 ? (
                            <div className="p-4 space-y-6">
                                {previewData.map((order, index) => (
                                    <div key={index} className="border rounded-lg bg-card overflow-hidden">
                                        <div className="bg-secondary/30 px-4 py-3 flex justify-between items-center border-b">
                                            <div>
                                                <h4 className="font-semibold text-foreground">Proveedor: {order.supplierName}</h4>
                                                <p className="text-xs text-muted-foreground">RUC: {order.supplierRuc} | Ref: {order.orderNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">S/ {order.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                                <p className="text-xs text-muted-foreground">{order.details.length} ítems</p>
                                            </div>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-transparent hover:bg-transparent">
                                                    <TableHead className="w-16">SKU</TableHead>
                                                    <TableHead>Artículo</TableHead>
                                                    <TableHead className="text-right">Cant.</TableHead>
                                                    <TableHead className="text-right">Costo Unit.</TableHead>
                                                    <TableHead className="text-right">Subtotal</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {order.details.map((detail, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="text-xs text-muted-foreground font-medium">{detail.itemSku}</TableCell>
                                                        <TableCell className="font-medium text-sm">{detail.itemName}</TableCell>
                                                        <TableCell className="text-right text-sm">{detail.quantity}</TableCell>
                                                        <TableCell className="text-right text-sm">S/ {detail.unitCost.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</TableCell>
                                                        <TableCell className="text-right font-semibold text-sm">S/ {detail.subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground">
                                <Package className="w-12 h-12 mb-4 opacity-50" />
                                <p className="text-lg font-medium text-foreground">No hay órdenes para autogenerar</p>
                                <p className="text-sm mt-1 text-center max-w-sm">
                                    No se encontraron ítems con stock crítico que tengan un proveedor asignado, o todos ya están en órdenes pendientes.
                                </p>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={onClose} disabled={isGenerating}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleConfirm} 
                        disabled={isGenerating || isFetching || !previewData || previewData.length === 0}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generando...
                            </>
                        ) : (
                            'Confirmar y Generar'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
