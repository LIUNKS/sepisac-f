import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Loader2, Rocket, AlertCircle, ArrowRight, Briefcase } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createProjectFromQuotation } from '../services/projectService';
import { getQuotations } from '@/features/cotizaciones/services/quotation.service';
import type { Project } from '../types';
import type { Quotation } from '@/features/cotizaciones/types';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyId?: string;
    existingProjects: Project[];
}

export const CreateProjectModal = ({
    isOpen,
    onClose,
    companyId,
    existingProjects,
}: CreateProjectModalProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedQuotationId, setSelectedQuotationId] = useState<string>('');

    const { data: quotationsData, isLoading: isLoadingQuotations } = useQuery({
        queryKey: ['quotations', companyId],
        queryFn: () => getQuotations(companyId || '', 0, 100),
        enabled: isOpen,
    });

    const quotations: Quotation[] = quotationsData?.content || [];
    const usedQuotationIds = new Set(existingProjects.map(p => p.quotationId).filter(Boolean));

    // Quotations that are approved and don't yet have an associated project
    const availableQuotations = quotations.filter(
        q => q.status === 'APROBADA' && !usedQuotationIds.has(q.id)
    );

    const createMutation = useMutation({
        mutationFn: (quotationId: string) => createProjectFromQuotation(quotationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('¡Proyecto autogenerado exitosamente desde la cotización!');
            setSelectedQuotationId('');
            onClose();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al generar el proyecto');
        }
    });

    const handleSubmit = () => {
        if (!selectedQuotationId) {
            toast.warning('Por favor selecciona una cotización aprobada');
            return;
        }
        createMutation.mutate(selectedQuotationId);
    };

    const selectedQuotation = availableQuotations.find(q => q.id === selectedQuotationId);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md bg-card border-border shadow-lg">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-center text-foreground">
                        Nuevo Proyecto Operativo
                    </DialogTitle>
                    <DialogDescription className="text-center text-xs text-muted-foreground">
                        En SEPI S.A.C., los proyectos operativos se generan a partir de cotizaciones comerciales aprobadas para preservar la trazabilidad de costos, mano de obra y materiales.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {isLoadingQuotations ? (
                        <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            Cargando cotizaciones aprobadas...
                        </div>
                    ) : availableQuotations.length === 0 ? (
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 space-y-3">
                            <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <p className="font-semibold mb-1">No hay cotizaciones aprobadas pendientes</p>
                                    <p className="text-muted-foreground">
                                        Todas las cotizaciones aprobadas ya cuentan con un proyecto asignado, o requieres aprobar una cotización activa en el módulo Comercial.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs font-medium border-amber-500/30 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                onClick={() => {
                                    onClose();
                                    navigate('/cotizaciones');
                                }}
                            >
                                Ir al Módulo de Cotizaciones
                                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-foreground block mb-1.5">
                                    Seleccionar Cotización Aprobada:
                                </label>
                                <Select
                                    value={selectedQuotationId}
                                    onValueChange={setSelectedQuotationId}
                                >
                                    <SelectTrigger className="w-full text-xs bg-background">
                                        <SelectValue placeholder="Seleccione una cotización..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableQuotations.map(q => (
                                            <SelectItem key={q.id} value={q.id} className="text-xs">
                                                <div className="flex items-center justify-between w-full gap-2">
                                                    <span className="font-semibold">{q.quotationNumber}</span>
                                                    <span className="text-muted-foreground truncate max-w-[150px]">{q.clientName}</span>
                                                    <span className="text-primary font-medium">S/ {(q.totalAmount || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedQuotation && (
                                <div className="p-3 bg-secondary/30 rounded-lg border border-border text-xs space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Cliente:</span>
                                        <span className="font-medium text-foreground">{selectedQuotation.clientName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Monto Total:</span>
                                        <span className="font-bold text-foreground">
                                            {selectedQuotation.currency === 'USD' ? '$' : 'S/'} {(selectedQuotation.totalAmount || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Servicio:</span>
                                        <span className="text-muted-foreground truncate max-w-[200px]">{selectedQuotation.serviceType || 'Servicio General'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={createMutation.isPending}
                        className="text-xs"
                    >
                        Cancelar
                    </Button>
                    {availableQuotations.length > 0 && (
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSubmit}
                            disabled={!selectedQuotationId || createMutation.isPending}
                            className="text-xs font-semibold"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <Rocket className="w-3.5 h-3.5 mr-1.5" />
                                    Iniciar Proyecto
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
