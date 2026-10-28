import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Project } from '../types';

export const exportProjectsToExcel = async (projects: Project[]) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SEPI S.A.C.';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Proyectos Operativos', {
        views: [{ state: 'frozen', ySplit: 1 }]
    });

    worksheet.columns = [
        { header: 'CÓDIGO', key: 'code', width: 18 },
        { header: 'TÍTULO DEL PROYECTO', key: 'title', width: 36 },
        { header: 'CLIENTE', key: 'clientName', width: 32 },
        { header: 'ESTADO', key: 'status', width: 22 },
        { header: 'FECHA INICIO', key: 'startDate', width: 16 },
        { header: 'FECHA FIN', key: 'endDate', width: 16 },
        { header: 'DESCRIPCIÓN', key: 'description', width: 40 },
        { header: 'FECHA REGISTRO', key: 'createdAt', width: 18 },
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
            case 'EN_PLANIFICACION':
                return 'En Planificación';
            case 'EN_PROGRESO':
            case 'EN_EJECUCION':
                return 'En Ejecución';
            case 'COMPLETADO':
                return 'Completado';
            case 'PAUSADO':
                return 'Pausado';
            case 'CANCELADO':
                return 'Cancelado';
            default:
                return status;
        }
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

    projects.forEach((p) => {
        const row = worksheet.addRow({
            code: p.code,
            title: p.title,
            clientName: p.clientName,
            status: formatStatusText(p.status),
            startDate: formatDate(p.startDate),
            endDate: formatDate(p.endDate),
            description: p.description || '-',
            createdAt: formatDate(p.createdAt),
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

            // Fechas centradas
            if (colNumber === 5 || colNumber === 6 || colNumber === 8) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }

            // Estado (columna 4)
            if (colNumber === 4) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                if (p.status === 'COMPLETADO') {
                    cell.font = { color: { argb: 'FF16A34A' }, bold: true };
                } else if (p.status === 'EN_PROGRESO' || p.status === 'EN_EJECUCION') {
                    cell.font = { color: { argb: 'FF2563EB' }, bold: true };
                } else if (p.status === 'EN_PLANIFICACION') {
                    cell.font = { color: { argb: 'FFD97706' }, bold: true };
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
    saveAs(blob, `Proyectos_SEPI_${dateStr}.xlsx`);
};
