import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { InventoryItem } from '../types';

interface ViewInventoryItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem | null;
}

export const ViewInventoryItemModal = ({ isOpen, onClose, item }: ViewInventoryItemModalProps) => {
    if (!item) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-card text-foreground border-border">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        Detalles del Artículo
                        <Badge 
                            variant="secondary"
                            className={`ml-2 gap-1.5 font-medium ${
                                item.stockQuantity <= 0
                                    ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                    : item.isLowStock
                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                            }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                item.stockQuantity <= 0 ? 'bg-red-600 dark:bg-red-400' :
                                item.isLowStock ? 'bg-amber-600 dark:bg-amber-400' :
                                'bg-emerald-600 dark:bg-emerald-400'
                            }`}></span>
                            {item.stockQuantity <= 0 ? 'Agotado' : item.isLowStock ? 'Bajo Stock' : 'Normal'}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Nombre</p>
                            <p className="font-semibold text-foreground">{item.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Código (SKU)</p>
                            <p className="font-mono text-sm text-foreground">{item.sku}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Categoría</p>
                            <p className="text-foreground">{item.category}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Ubicación</p>
                            <p className="text-foreground">{item.location}</p>
                        </div>
                    </div>

                    <div className="border-t border-border pt-4 grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Stock Actual</p>
                            <p className="text-2xl font-bold text-foreground">
                                {item.stockQuantity} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Alerta Mínima</p>
                            <p className="text-2xl font-bold text-foreground">
                                {item.minStockAlert} <span className="text-sm font-normal text-muted-foreground">{item.unit !== 'disponibles' ? item.unit : ''}</span>
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-border pt-4 grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Costo de Compra</p>
                            <p className="font-medium text-foreground">
                                S/ {item.purchaseCost.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Precio de Venta</p>
                            <p className="font-medium text-foreground">
                                S/ {item.salePrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground text-right pt-2">
                        ID Sistema: {item.id} <br />
                        Última actualización: {new Date(item.createdAt).toLocaleDateString('es-PE')}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
