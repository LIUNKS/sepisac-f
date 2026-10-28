import { useState, useMemo } from 'react';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCompanies } from '@/features/empresas/api';
import { useSearchInvoices } from '../api';
import { InvoicesTable, PaymentModal } from '../components';
import type { InvoiceResponseDTO } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    DownloadCloud,
    DollarSign,
    Clock,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { exportInvoicesToExcel } from '../utils/exportInvoicesToExcel';

export const FacturacionPage = () => {
    const { user, hasRole } = useAuthStore();
    const isSuperAdmin = hasRole(['SUPERADMIN']);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'all' | 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'VENCIDA' | 'ANULADA'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'view'>('add');
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponseDTO | null>(null);

    const { data: companiesPage } = useCompanies({ page: 0, size: 100 }, isSuperAdmin);

    const effectiveCompanyId = isSuperAdmin
        ? (selectedCompanyId !== 'all' ? selectedCompanyId : undefined)
        : user?.companyId;

    // Load full invoice dataset for the tenant to power real-time KPIs, tab badges, and instant filtering
    const { data, isLoading } = useSearchInvoices({
        companyId: effectiveCompanyId,
        size: 1000,
        sort: 'createdAt,desc'
    });

    const allInvoices = data?.content || [];

    // Financial KPI Metrics
    const activeInvoices = allInvoices.filter(i => i.paymentStatus !== 'ANULADA');
    const totalBilled = activeInvoices.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
    const totalCollected = activeInvoices.reduce((sum, i) => sum + (Number(i.totalPaid) || 0), 0);
    const totalPending = activeInvoices.reduce((sum, i) => sum + (Number(i.balanceDue) || 0), 0);
    const overdueInvoices = activeInvoices.filter(i => i.paymentStatus === 'VENCIDA');
    const totalOverdue = overdueInvoices.reduce((sum, i) => sum + (Number(i.balanceDue) || 0), 0);

    const formatSoles = (amount: number) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
    };

    const kpiMetrics = [
        {
            title: 'Total Facturado',
            value: formatSoles(totalBilled),
            subtitle: `${activeInvoices.length} facturas comerciales emitidas`,
            icon: DollarSign,
            bg: 'bg-secondary text-muted-foreground'
        },
        {
            title: 'Total Cobrado',
            value: formatSoles(totalCollected),
            subtitle: 'Pagos y abonos recaudados',
            icon: CheckCircle2,
            bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
        },
        {
            title: 'Saldo Por Cobrar',
            value: formatSoles(totalPending),
            subtitle: 'Cuentas pendientes de cobro',
            icon: Clock,
            bg: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
        },
        {
            title: 'Cobranza Vencida',
            value: formatSoles(totalOverdue),
            subtitle: `${overdueInvoices.length} facturas con plazo superado`,
            icon: AlertTriangle,
            bg: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
        }
    ];

    // Status counts
    const countTotal = allInvoices.length;
    const countPending = allInvoices.filter(i => i.paymentStatus === 'PENDIENTE').length;
    const countPartial = allInvoices.filter(i => i.paymentStatus === 'PARCIAL').length;
    const countPaid = allInvoices.filter(i => i.paymentStatus === 'PAGADA').length;
    const countOverdue = allInvoices.filter(i => i.paymentStatus === 'VENCIDA').length;
    const countCancelled = allInvoices.filter(i => i.paymentStatus === 'ANULADA').length;

    const tabs = [
        { id: 'all' as const, label: 'Todas', count: countTotal },
        { id: 'PENDIENTE' as const, label: 'Pendientes', count: countPending },
        { id: 'PARCIAL' as const, label: 'Pago Parcial', count: countPartial },
        { id: 'PAGADA' as const, label: 'Pagadas', count: countPaid },
        { id: 'VENCIDA' as const, label: 'Vencidas', count: countOverdue },
        { id: 'ANULADA' as const, label: 'Anuladas', count: countCancelled },
    ];

    // Filter invoices by tab and search
    const filteredInvoices = useMemo(() => {
        let list = allInvoices;

        if (activeTab !== 'all') {
            list = list.filter(i => i.paymentStatus === activeTab);
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            list = list.filter(i =>
                i.invoiceNumber?.toLowerCase().includes(term) ||
                i.clientName?.toLowerCase().includes(term) ||
                i.projectCode?.toLowerCase().includes(term) ||
                i.quotationNumber?.toLowerCase().includes(term) ||
                i.companyName?.toLowerCase().includes(term)
            );
        }

        return list;
    }, [allInvoices, activeTab, searchTerm]);

    // Paginated slice
    const totalPages = Math.ceil(filteredInvoices.length / pageSize);
    const paginatedInvoices = useMemo(() => {
        const start = page * pageSize;
        return filteredInvoices.slice(start, start + pageSize);
    }, [filteredInvoices, page, pageSize]);

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
        <div className="space-y-6">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiMetrics.map((kpi, idx) => (
                    <Card key={idx} className="border-border shadow-sm relative overflow-hidden">
                        <CardContent className="p-6">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                                {kpi.title}
                            </span>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                    {isLoading ? '...' : kpi.value}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>{kpi.subtitle}</span>
                            </div>

                            <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Table Card with Unified Toolbar */}
            <Card className="border-border shadow-sm">
                <div className="border-b border-border p-0">
                    <div className="flex items-center justify-between px-6 pt-4 gap-4 flex-nowrap overflow-x-auto">
                        {/* Tabs with Counts */}
                        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setPage(0);
                                    }}
                                    className={`pb-3.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${activeTab === tab.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-secondary text-muted-foreground'
                                        }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search, Filter and Export Toolbar */}
                        <div className="flex items-center gap-2 mb-2.5 shrink-0">
                            {isSuperAdmin && (
                                <Select
                                    value={selectedCompanyId}
                                    onValueChange={(val) => {
                                        setSelectedCompanyId(val);
                                        setPage(0);
                                    }}
                                >
                                    <SelectTrigger className="h-8 text-xs w-36 sm:w-44 bg-background">
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

                            <div className="relative w-44 sm:w-56">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar factura, cliente, proyecto..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(0);
                                    }}
                                    className="h-8 pl-8 text-xs bg-background"
                                />
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-medium px-2.5"
                                onClick={() => exportInvoicesToExcel(filteredInvoices)}
                                disabled={filteredInvoices.length === 0}
                            >
                                <DownloadCloud className="w-3.5 h-3.5 mr-1 text-primary" />
                                Exportar
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    <InvoicesTable
                        invoices={paginatedInvoices}
                        isLoading={isLoading}
                        onAddPayment={handleAddPayment}
                        onViewPayments={handleViewPayments}
                    />
                </div>
            </Card>

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
                <div className="flex justify-end items-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Página {page + 1} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                    >
                        Siguiente
                    </Button>
                </div>
            )}

            {/* Modal de Abonos / Historial de Pagos */}
            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                invoice={selectedInvoice}
                mode={modalMode}
            />
        </div>
    );
};
