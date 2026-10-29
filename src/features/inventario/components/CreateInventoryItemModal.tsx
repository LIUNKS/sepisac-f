import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInventoryItem } from '../services/inventory.service';
import { toast } from 'sonner';

interface CreateInventoryItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyId?: string;
}

export const CreateInventoryItemModal = ({ isOpen, onClose, companyId }: CreateInventoryItemModalProps) => {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        stockQuantity: 0,
        purchaseCost: 0,
        salePrice: 0,
        minStockAlert: 5,
    });

    const resetForm = () => {
        setFormData({
            sku: '',
            name: '',
            description: '',
            stockQuantity: 0,
            purchaseCost: 0,
            salePrice: 0,
            minStockAlert: 5,
        });
    };

    const mutation = useMutation({
        mutationFn: async () => {
            return await createInventoryItem({
                companyId,
                sku: formData.sku.trim(),
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                stockQuantity: Number(formData.stockQuantity) || 0,
                purchaseCost: Number(formData.purchaseCost) || 0,
                salePrice: Number(formData.salePrice) || 0,
                minStockAlert: Number(formData.minStockAlert) || 0,
            });
        },
        onSuccess: () => {
            toast.success('Artículo creado exitosamente en el inventario');
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            resetForm();
            onClose();
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Error al registrar el artículo';
            toast.error(message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.sku.trim() || !formData.name.trim()) {
            toast.warning('El código SKU y el nombre son obligatorios');
            return;
        }
        mutation.mutate();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetForm(); onClose(); } }}>
            <DialogContent className="sm:max-w-[480px] bg-card text-foreground border-border">
                <DialogHeader>
                    <DialogTitle>Nuevo Artículo de Inventario</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label htmlFor="create-sku" className="text-right text-xs font-medium">
                            Código (SKU) *
                        </Label>
                        <Input
                            id="create-sku"
                            placeholder="Ej. MAT-SOL-001"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            className="col-span-3 bg-background border-border text-foreground"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label htmlFor="create-name" className="text-right text-xs font-medium">
                            Nombre *
                        </Label>
                        <Input
                            id="create-name"
                            placeholder="Ej. Soldadura E-7018 1/8"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="col-span-3 bg-background border-border text-foreground"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label htmlFor="create-desc" className="text-right text-xs font-medium">
                            Descripción
                        </Label>
                        <Input
                            id="create-desc"
                            placeholder="Especificación técnica o detalles"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="col-span-3 bg-background border-border text-foreground"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label htmlFor="create-stock" className="text-right text-xs font-medium">
                            Stock Inicial
                        </Label>
                        <Input
                            id="create-stock"
                            type="number"
                            min="0"
                            value={formData.stockQuantity}
                            onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                            className="col-span-3 bg-background border-border text-foreground"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label htmlFor="create-cost" className="text-right text-xs font-medium">
                            Costo Compra
                        </Label>
                        <Input
                            id="create-cost"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.purchaseCost}
                            onChange={(e) => setFormData({ ...formData, purchaseCost: parseFloat(e.target.value) || 0 })}
                            className="col-span-3 bg-background border-border text-foreground"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label htmlFor="create-price" className="text-right text-xs font-medium">
                            Precio Venta
                        </Label>
                        <Input
                            id="create-price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.salePrice}
                            onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                            className="col-span-3 bg-background border-border text-foreground"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label htmlFor="create-min-stock" className="text-right text-xs font-medium">
                            Alerta Mínimo
                        </Label>
                        <Input
                            id="create-min-stock"
                            type="number"
                            min="0"
                            value={formData.minStockAlert}
                            onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 0 })}
                            className="col-span-3 bg-background border-border text-foreground"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="border-border text-foreground">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Guardando...' : 'Crear Artículo'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
