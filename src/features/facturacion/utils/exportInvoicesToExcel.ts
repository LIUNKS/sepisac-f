import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { InvoiceResponseDTO } from '../types';

export const exportInvoicesToExcel = async (invoices: InvoiceResponseDTO[]) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SEPI S.A.C.';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Facturas y Cobranzas', {
        views: [{ state: 'frozen', ySplit: 1 }]
    });

    worksheet.columns = [
        { header: 'N° FACTURA', key: 'invoiceNumber', width: 16 },
        { header: 'CLIENTE', key: 'clientName', width: 32 },
        { header: 'PROYECTO', key: 'projectCode', width: 18 },
        { header: 'COTIZACIÓN', key: 'quotationNumber', width: 18 },
        { header: 'EMISIÓN', key: 'issueDate', width: 16 },
        { header: 'VENCIMIENTO', key: 'dueDate', width: 16 },
        { header: 'MONEDA', key: 'currency', width: 12 },
        { header: 'MONTO TOTAL', key: 'totalAmount', width: 18 },
        { header: 'TOTAL COBRADO', key: 'totalPaid', width: 18 },
        { header: 'SALDO PENDIENTE', key: 'balanceDue', width: 18 },
        { header: 'ESTADO', key: 'status', width: 18 },
    ];

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

    const formatStatusText = (status: string) => {
        switch (status) {
            case 'PENDIENTE':
                return 'Pendiente';
            case 'PARCIAL':
                return 'Pago Parcial';
            case 'PAGADA':
                return 'Pagada';
            case 'VENCIDA':
                return 'Vencida';
            case 'ANULADA':
                return 'Anulada';
            default:
                return status;
        }
    };

    const formatDate = (dateStr?: string) => {
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

    invoices.forEach((inv) => {
        const row = worksheet.addRow({
            invoiceNumber: inv.invoiceNumber,
            clientName: inv.clientName,
            projectCode: inv.projectCode || '-',
            quotationNumber: inv.quotationNumber || '-',
            issueDate: formatDate(inv.issueDate),
            dueDate: formatDate(inv.dueDate),
            currency: inv.currency,
            totalAmount: inv.totalAmount,
            totalPaid: inv.totalPaid,
            balanceDue: inv.balanceDue,
            status: formatStatusText(inv.paymentStatus),
        });

        row.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
            cell.alignment = { vertical: 'middle' };

            // Factura y Códigos centrados
            if (colNumber === 1 || colNumber === 3 || colNumber === 4 || colNumber === 5 || colNumber === 6 || colNumber === 7) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                if (colNumber === 1) cell.font = { bold: true };
            }

            // Moneda (columnas 8, 9, 10)
            if (colNumber === 8 || colNumber === 9 || colNumber === 10) {
                cell.numFmt = '"S/"#,##0.00';
                if (colNumber === 10 && inv.balanceDue > 0) {
                    cell.font = { color: { argb: 'FFDC2626' }, bold: true };
                }
            }

            // Estado (columna 11)
            if (colNumber === 11) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                if (inv.paymentStatus === 'PAGADA') {
                    cell.font = { color: { argb: 'FF16A34A' }, bold: true };
                } else if (inv.paymentStatus === 'PARCIAL') {
                    cell.font = { color: { argb: 'FF2563EB' }, bold: true };
                } else if (inv.paymentStatus === 'PENDIENTE') {
                    cell.font = { color: { argb: 'FFD97706' }, bold: true };
                } else if (inv.paymentStatus === 'VENCIDA') {
                    cell.font = { color: { argb: 'FFDC2626' }, bold: true };
                } else {
                    cell.font = { color: { argb: 'FF64748B' } };
                }
            }
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    saveAs(blob, `Facturacion_SEPI_${dateStr}.xlsx`);
};
