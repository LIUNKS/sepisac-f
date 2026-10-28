import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Project } from '@/features/projects/types';
import type { Quotation } from '@/features/cotizaciones/types';
import type { InvoiceResponseDTO } from '@/features/facturacion/types';
import type { InventoryItem } from '@/features/inventario/types';
import type { EmployeeResponseDTO } from '@/features/empleados/types';
import type { MachineryResponseDTO } from '@/features/maquinaria/types';

interface ConsolidatedReportData {
    projects: Project[];
    quotations: Quotation[];
    invoices: InvoiceResponseDTO[];
    inventory: InventoryItem[];
    employees: EmployeeResponseDTO[];
    machinery: MachineryResponseDTO[];
}

export const exportConsolidatedReportToExcel = async (data: ConsolidatedReportData) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SEPI S.A.C. - Sistema ERP';
    workbook.created = new Date();

    const applyHeaderStyle = (worksheet: ExcelJS.Worksheet) => {
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF0F172A' } // Slate 900
            };
            cell.font = {
                color: { argb: 'FFFFFFFF' },
                bold: true,
                size: 11
            };
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        headerRow.height = 25;
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('es-PE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    // 1. HOJA: RESUMEN EJECUTIVO
    const summarySheet = workbook.addWorksheet('Resumen Ejecutivo');
    summarySheet.columns = [
        { header: 'ÁREA OPERATIVA / MÓDULO', key: 'metric', width: 35 },
        { header: 'TOTAL REGISTROS', key: 'count', width: 22 },
        { header: 'ESTADO PRINCIPAL / METRICA', key: 'status', width: 35 },
    ];
    applyHeaderStyle(summarySheet);

    const activeProjects = data.projects.filter(p => p.status === 'EN_PROGRESO' || p.status === 'EN_EJECUCION').length;
    const approvedQuotes = data.quotations.filter(q => q.status === 'APROBADA').length;
    const paidInvoices = data.invoices.filter(i => i.paymentStatus === 'PAGADA').length;
    const availableStaff = data.employees.filter(e => e.isAvailable).length;
    const availableMachinery = data.machinery.filter(m => m.status === 'DISPONIBLE').length;

    summarySheet.addRow({ metric: '1. Proyectos de Mantenimiento', count: data.projects.length, status: `${activeProjects} en ejecución activa` });
    summarySheet.addRow({ metric: '2. Cotizaciones y Propuestas', count: data.quotations.length, status: `${approvedQuotes} aprobadas comercialmente` });
    summarySheet.addRow({ metric: '3. Facturas y Cobranzas', count: data.invoices.length, status: `${paidInvoices} totalmente recaudadas` });
    summarySheet.addRow({ metric: '4. Artículos en Inventario', count: data.inventory.length, status: 'Catálogo de repuestos y EPP' });
    summarySheet.addRow({ metric: '5. Personal y Cuadrillas', count: data.employees.length, status: `${availableStaff} técnicos disponibles` });
    summarySheet.addRow({ metric: '6. Flota y Maquinaria', count: data.machinery.length, status: `${availableMachinery} equipos operativos` });

    // 2. HOJA: PROYECTOS
    const projectsSheet = workbook.addWorksheet('Proyectos');
    projectsSheet.columns = [
        { header: 'CÓDIGO', key: 'code', width: 16 },
        { header: 'TÍTULO', key: 'title', width: 36 },
        { header: 'CLIENTE', key: 'clientName', width: 30 },
        { header: 'ESTADO', key: 'status', width: 20 },
        { header: 'INICIO', key: 'startDate', width: 14 },
        { header: 'FIN', key: 'endDate', width: 14 },
    ];
    applyHeaderStyle(projectsSheet);
    data.projects.forEach(p => {
        projectsSheet.addRow({
            code: p.code,
            title: p.title,
            clientName: p.clientName,
            status: p.status,
            startDate: formatDate(p.startDate),
            endDate: formatDate(p.endDate),
        });
    });

    // 3. HOJA: COTIZACIONES
    const quotesSheet = workbook.addWorksheet('Cotizaciones');
    quotesSheet.columns = [
        { header: 'N° COTIZACIÓN', key: 'number', width: 18 },
        { header: 'CLIENTE', key: 'client', width: 32 },
        { header: 'SERVICIO', key: 'service', width: 25 },
        { header: 'MONTO TOTAL', key: 'amount', width: 18 },
        { header: 'ESTADO', key: 'status', width: 18 },
    ];
    applyHeaderStyle(quotesSheet);
    data.quotations.forEach(q => {
        quotesSheet.addRow({
            number: q.quotationNumber,
            client: q.clientName,
            service: q.serviceType,
            amount: q.totalAmount,
            status: q.status,
        });
    });

    // 4. HOJA: FACTURACIÓN
    const invoicesSheet = workbook.addWorksheet('Facturación');
    invoicesSheet.columns = [
        { header: 'N° FACTURA', key: 'invoiceNumber', width: 18 },
        { header: 'CLIENTE', key: 'clientName', width: 32 },
        { header: 'MONTO TOTAL', key: 'totalAmount', width: 18 },
        { header: 'TOTAL PAGADO', key: 'totalPaid', width: 18 },
        { header: 'SALDO', key: 'balanceDue', width: 18 },
        { header: 'ESTADO', key: 'paymentStatus', width: 18 },
    ];
    applyHeaderStyle(invoicesSheet);
    data.invoices.forEach(i => {
        invoicesSheet.addRow({
            invoiceNumber: i.invoiceNumber,
            clientName: i.clientName,
            totalAmount: i.totalAmount,
            totalPaid: i.totalPaid,
            balanceDue: i.balanceDue,
            paymentStatus: i.paymentStatus,
        });
    });

    // 5. HOJA: INVENTARIO
    const invSheet = workbook.addWorksheet('Inventario');
    invSheet.columns = [
        { header: 'SKU', key: 'sku', width: 16 },
        { header: 'MATERIAL / REPUESTO', key: 'name', width: 36 },
        { header: 'STOCK ACTUAL', key: 'currentStock', width: 16 },
        { header: 'STOCK MÍNIMO', key: 'minStock', width: 16 },
        { header: 'PRECIO UNIT. (S/)', key: 'unitPrice', width: 18 },
    ];
    applyHeaderStyle(invSheet);
    data.inventory.forEach(item => {
        invSheet.addRow({
            sku: item.sku,
            name: item.name,
            currentStock: item.stockQuantity,
            minStock: item.minStockAlert,
            unitPrice: item.purchaseCost,
        });
    });

    // 6. HOJA: PERSONAL
    const empSheet = workbook.addWorksheet('Personal');
    empSheet.columns = [
        { header: 'NOMBRE COMPLETO', key: 'fullName', width: 32 },
        { header: 'ESPECIALIDAD', key: 'specialty', width: 25 },
        { header: 'CONTRATO', key: 'contractType', width: 20 },
        { header: 'SUELDO BASE', key: 'baseSalary', width: 18 },
        { header: 'DISPONIBILIDAD', key: 'isAvailable', width: 18 },
    ];
    applyHeaderStyle(empSheet);
    data.employees.forEach(e => {
        empSheet.addRow({
            fullName: e.fullName,
            specialty: e.specialty,
            contractType: e.contractType,
            baseSalary: e.baseSalary,
            isAvailable: e.isAvailable ? 'Disponible' : 'Asignado',
        });
    });

    // 7. HOJA: MAQUINARIA
    const maqSheet = workbook.addWorksheet('Maquinaria');
    maqSheet.columns = [
        { header: 'CÓDIGO', key: 'code', width: 16 },
        { header: 'EQUIPO', key: 'name', width: 32 },
        { header: 'ESTADO', key: 'status', width: 20 },
        { header: 'ÚLTIMO MTTO', key: 'lastMaintenanceDate', width: 18 },
        { header: 'PRÓXIMO MTTO', key: 'nextMaintenanceDate', width: 18 },
    ];
    applyHeaderStyle(maqSheet);
    data.machinery.forEach(m => {
        maqSheet.addRow({
            code: m.code,
            name: m.name,
            status: m.status,
            lastMaintenanceDate: formatDate(m.lastMaintenanceDate),
            nextMaintenanceDate: formatDate(m.nextMaintenanceDate),
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    saveAs(blob, `Reporte_Consolidado_SEPI_${dateStr}.xlsx`);
};
