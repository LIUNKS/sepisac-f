import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Rocket } from 'lucide-react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createProjectFromQuotation } from '@/features/projects/services/projectService';
import type { Quotation } from '../types';

interface Props {
    quotation: Quotation | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const CreateProjectFromQuotationModal = ({ quotation, isOpen, onClose, onSuccess }: Props) => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: () => {
            if (!quotation) throw new Error("Sin cotización");
            return createProjectFromQuotation(quotation.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('¡Proyecto autogenerado exitosamente desde la cotización!');
            if (onSuccess) onSuccess();
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al generar el proyecto');
        }
    });

    if (!quotation) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Rocket className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-xl">¿Convertir Cotización en Proyecto?</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        El sistema leerá automáticamente la cotización <strong>{quotation.quotationNumber}</strong> para <strong>{quotation.clientName}</strong>, y generará un entorno operativo de proyecto con el inventario y cronograma requerido.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-6 flex flex-row gap-2 justify-center sm:justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={createMutation.isPending}
                        className="w-full"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={() => createMutation.mutate()}
                        disabled={createMutation.isPending}
                        className="w-full"
                    >
                        {createMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generando...
                            </>
                        ) : (
                            'Sí, autogenerar proyecto'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
