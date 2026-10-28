import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Supplier } from '../types';

export const exportSuppliersToExcel = async (suppliers: Supplier[]) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SEPI S.A.C.';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Proveedores', {
        views: [{ state: 'frozen', ySplit: 1 }]
    });

    worksheet.columns = [
        { header: 'RUC', key: 'ruc', width: 18 },
        { header: 'RAZÓN SOCIAL', key: 'businessName', width: 38 },
        { header: 'TELÉFONO DE CONTACTO', key: 'contactPhone', width: 22 },
        { header: 'CORREO ELECTRÓNICO', key: 'email', width: 30 },
        { header: 'EMPRESA', key: 'companyName', width: 25 },
        { header: 'FECHA REGISTRO', key: 'createdAt', width: 20 },
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

    suppliers.forEach((s) => {
        const row = worksheet.addRow({
            ruc: s.ruc,
            businessName: s.businessName,
            contactPhone: s.contactPhone || '-',
            email: s.email || '-',
            companyName: s.companyName || 'SEPI S.A.C.',
            createdAt: formatDate(s.createdAt),
        });

        row.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
            cell.alignment = { vertical: 'middle' };

            // RUC centrado y en negrita
            if (colNumber === 1) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.font = { bold: true };
            }

            // Teléfono y Fecha centrados
            if (colNumber === 3 || colNumber === 6) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    saveAs(blob, `Proveedores_SEPI_${dateStr}.xlsx`);
};
