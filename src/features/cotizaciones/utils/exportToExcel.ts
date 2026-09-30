import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Quotation } from '../types';

export const exportQuotationsToExcel = async (quotations: Quotation[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cotizaciones');

    // Add headers
    worksheet.columns = [
        { header: 'Nº Cotización', key: 'quotationNumber', width: 20 },
        { header: 'Cliente', key: 'clientName', width: 30 },
        { header: 'Servicio', key: 'serviceType', width: 30 },
        { header: 'Empresa', key: 'companyName', width: 25 },
        { header: 'Moneda', key: 'currency', width: 10 },
        { header: 'Costo Base', key: 'subtotalCosts', width: 15 },
        { header: 'Margen (%)', key: 'profitMarginPercentage', width: 12 },
        { header: 'Monto Total', key: 'totalAmount', width: 15 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Fecha de Creación', key: 'createdAt', width: 20 },
    ];

    // Format headers
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' } // Slate-900
    };

    // Add rows
    quotations.forEach(q => {
        worksheet.addRow({
            quotationNumber: q.quotationNumber,
            clientName: q.clientName,
            serviceType: q.serviceType,
            companyName: q.companyName,
            currency: q.currency,
            subtotalCosts: q.subtotalCosts,
            profitMarginPercentage: q.profitMarginPercentage,
            totalAmount: q.totalAmount,
            status: q.status,
            createdAt: new Date(q.createdAt).toLocaleDateString('es-PE'),
        });
    });

    // Format currency columns
    const currencyColOpts = { numFmt: '#,##0.00' };
    worksheet.getColumn('subtotalCosts').numFmt = currencyColOpts.numFmt;
    worksheet.getColumn('totalAmount').numFmt = currencyColOpts.numFmt;
    worksheet.getColumn('profitMarginPercentage').numFmt = '0.00%';

    // Generate blob and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Cotizaciones_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};
