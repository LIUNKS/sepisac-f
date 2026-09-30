import { useState, useEffect } from 'react';
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
import { updateInventoryItem } from '../services/inventory.service';
import type { InventoryItem } from '../types';

interface EditInventoryItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem | null;
}

export const EditInventoryItemModal = ({ isOpen, onClose, item }: EditInventoryItemModalProps) => {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        purchaseCost: 0,
        salePrice: 0,
        minStockAlert: 5
    });

    useEffect(() => {
        if (item) {
            setFormData({
                sku: item.sku,
                name: item.name,
                description: item.description || '',
                purchaseCost: item.purchaseCost,
                salePrice: item.salePrice,
                minStockAlert: item.minStockAlert
            });
        }
    }, [item]);

    const mutation = useMutation({
        mutationFn: async () => {
            if (!item) return;
            await updateInventoryItem(item.id, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            onClose();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-card text-foreground border-border">
                <DialogHeader>
                    <DialogTitle>Editar Artículo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sku" className="text-right">
                            Código (SKU)
                        </Label>
                        <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            className="col-span-3 bg-background border-border text-foreground"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nombre
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="col-span-3 bg-background border-border text-foreground"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Ubicación
                        </Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="col-span-3 bg-background border-border text-foreground"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="purchaseCost" className="text-right">
                            Costo
                        </Label>
                        <Input
                            id="purchaseCost"
                            type="number"
                            step="0.01"
                            value={formData.purchaseCost}
                            onChange={(e) => setFormData({ ...formData, purchaseCost: parseFloat(e.target.value) || 0 })}
                            className="col-span-3 bg-background border-border text-foreground"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="salePrice" className="text-right">
                            Precio
                        </Label>
                        <Input
                            id="salePrice"
                            type="number"
                            step="0.01"
                            value={formData.salePrice}
                            onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                            className="col-span-3 bg-background border-border text-foreground"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="minStockAlert" className="text-right">
                            Alerta Min.
                        </Label>
                        <Input
                            id="minStockAlert"
                            type="number"
                            value={formData.minStockAlert}
                            onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 0 })}
                            className="col-span-3 bg-background border-border text-foreground"
                        />
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} className="border-border text-foreground">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
