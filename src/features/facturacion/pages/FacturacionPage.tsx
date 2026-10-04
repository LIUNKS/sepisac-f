import { useState } from 'react';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCompanies } from '@/features/empresas/api';
import { useInvoices } from '../api';
import { InvoicesTable, PaymentModal } from '../components';
import type { InvoiceResponseDTO } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

export const FacturacionPage = () => {
    const { user, hasRole } = useAuthStore();
    const isSuperAdmin = hasRole(['SUPERADMIN']);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('PENDIENTE');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'view'>('add');
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponseDTO | null>(null);

    // The backend endpoint is /api/invoices/status/{status}
    // and allows passing 'PENDIENTE', 'PARCIAL', 'PAGADA', 'VENCIDA', 'ANULADA'
    const { data: companiesPage } = useCompanies({ page: 0, size: 100 }, isSuperAdmin);

    const effectiveCompanyId = isSuperAdmin
        ? (selectedCompanyId !== 'all' ? selectedCompanyId : undefined)
        : user?.companyId;

    const { data: invoices, isLoading } = useInvoices(selectedStatus, effectiveCompanyId);

    const handleAddPayment = (invoice: InvoiceResponseDTO) => {
        setSelectedInvoice(invoice);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleViewPayments = (invoice: InvoiceResponseDTO) => {
        setSelectedInvoice(invoice);
        setModalMode('view');
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">FacturaciÃ³n y Cobranzas</h2>
                    <p className="text-muted-foreground">GestiÃ³n de facturas emitidas y registro de pagos</p>
                </div>
            </div>

            <div className="border-b border-border/50 pb-px">
                <button className="relative px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 text-primary">
                    <Receipt className="w-4 h-4" />
                    Facturas
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                </button>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {isSuperAdmin && (
                                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Todas las empresas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las empresas</SelectItem>
                                        {companiesPage?.content.map((company) => (
                                            <SelectItem key={company.id} value={company.id}>
                                                {company.businessName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Estado:</span>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                                    <SelectItem value="PARCIAL">Pago Parcial</SelectItem>
                                    <SelectItem value="VENCIDA">Vencidas</SelectItem>
                                    <SelectItem value="PAGADA">Pagadas</SelectItem>
                                    <SelectItem value="ANULADA">Anuladas</SelectItem>
                                </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <InvoicesTable
                        invoices={invoices || []}
                        isLoading={isLoading}
                        onAddPayment={handleAddPayment}
                        onViewPayments={handleViewPayments}
                    />
                </CardContent>
            </Card>

            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                invoice={selectedInvoice}
                mode={modalMode}
            />
        </div>
    );
};


