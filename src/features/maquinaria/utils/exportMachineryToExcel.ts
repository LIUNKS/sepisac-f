import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { MachineryResponseDTO } from '../types';

export const exportMachineryToExcel = async (machineryList: MachineryResponseDTO[]) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SEPI S.A.C.';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Maquinaria y Equipos', {
        views: [{ state: 'frozen', ySplit: 1 }]
    });

    worksheet.columns = [
        { header: 'CÓDIGO', key: 'code', width: 16 },
        { header: 'EQUIPO / MAQUINARIA', key: 'name', width: 35 },
        { header: 'ESTADO OPERATIVO', key: 'status', width: 22 },
        { header: 'ÚLTIMO MANTENIMIENTO', key: 'lastMaintenance', width: 24 },
        { header: 'PRÓXIMO MANTENIMIENTO', key: 'nextMaintenance', width: 24 },
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

    const formatStatusText = (status: string) => {
        switch (status) {
            case 'DISPONIBLE':
                return 'Disponible';
            case 'EN_USO':
                return 'En Uso';
            case 'EN_MANTENIMIENTO':
                return 'Mantenimiento';
            case 'DE_BAJA':
                return 'De Baja';
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

    machineryList.forEach((item) => {
        const row = worksheet.addRow({
            code: item.code,
            name: item.name,
            status: formatStatusText(item.status),
            lastMaintenance: formatDate(item.lastMaintenanceDate),
            nextMaintenance: formatDate(item.nextMaintenanceDate),
            companyName: item.companyName || 'SEPI S.A.C.',
            createdAt: formatDate(item.createdAt),
        });

        row.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
            cell.alignment = { vertical: 'middle' };

            // Código centrado
            if (colNumber === 1) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.font = { bold: true };
            }

            // Estado (columna 3)
            if (colNumber === 3) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                if (item.status === 'DISPONIBLE') {
                    cell.font = { color: { argb: 'FF16A34A' }, bold: true };
                } else if (item.status === 'EN_USO') {
                    cell.font = { color: { argb: 'FF2563EB' }, bold: true };
                } else if (item.status === 'EN_MANTENIMIENTO') {
                    cell.font = { color: { argb: 'FFD97706' }, bold: true };
                } else {
                    cell.font = { color: { argb: 'FF64748B' } };
                }
            }

            // Fechas centradas
            if (colNumber === 4 || colNumber === 5 || colNumber === 7) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    saveAs(blob, `Maquinaria_Equipos_SEPI_${dateStr}.xlsx`);
};
