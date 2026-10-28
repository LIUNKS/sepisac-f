import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { DashboardData } from '../types';

export const exportDashboardToExcel = async (data: DashboardData, companyName?: string) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SEPI S.A.C. ERP';
    workbook.created = new Date();

    // -------------------------------------------------------------
    // HOJA 1: RESUMEN EJECUTIVO Y KPIS
    // -------------------------------------------------------------
    const wsSummary = workbook.addWorksheet('Resumen Ejecutivo', {
        views: [{ showGridLines: true }]
    });

    // Column widths
    wsSummary.columns = [
        { width: 5 },  // A
        { width: 35 }, // B
        { width: 25 }, // C
        { width: 25 }, // D
        { width: 25 }  // E
    ];

    // Banner Title
    wsSummary.mergeCells('B2:E2');
    const titleCell = wsSummary.getCell('B2');
    titleCell.value = 'SEPI S.A.C. - REPORTE GERENCIAL DE INDICADORES (DASHBOARD)';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // Slate 900
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    wsSummary.getRow(2).height = 35;

    // Subtitle / Date
    wsSummary.mergeCells('B3:E3');
    const subCell = wsSummary.getCell('B3');
    subCell.value = `Empresa: ${companyName || 'SEPI S.A.C.'} | Fecha de Emisión: ${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE')}`;
    subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };
    subCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // KPI Section Title
    wsSummary.getCell('B5').value = 'INDICADORES CLAVE DEL MES';
    wsSummary.getCell('B5').font = { bold: true, size: 11, color: { argb: 'FF1E293B' } };

    // KPI Table Headers
    const kpiHeaders = ['MÉTRICA / INDICADOR', 'VALOR ACTUAL', 'TENDENCIA / VARIACIÓN'];
    ['B6', 'C6', 'D6'].forEach((cellId, idx) => {
        const cell = wsSummary.getCell(cellId);
        cell.value = kpiHeaders[idx];
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }; // Blue 600
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    wsSummary.getRow(6).height = 24;

    const kpiRows = [
        ['Ingresos Mensuales (Cobranzas)', `S/ ${Number(data.ingresosMensuales || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, `${data.ingresosTrend >= 0 ? '+' : ''}${Number(data.ingresosTrend || 0).toFixed(1)}% vs mes anterior`],
        ['Egresos Mensuales (Compras)', `S/ ${Number(data.egresosMensuales || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, `${data.egresosTrend >= 0 ? '+' : ''}${Number(data.egresosTrend || 0).toFixed(1)}% vs mes anterior`],
        ['Margen Operativo Bruto Estimado', `S/ ${(Number(data.ingresosMensuales || 0) - Number(data.egresosMensuales || 0)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, 'Balance del periodo'],
        ['Cotizaciones Aprobadas', `${data.cotizacionesAprobadas || 0} cotizaciones`, `${data.cotizacionesTrend >= 0 ? '+' : ''}${data.cotizacionesTrend || 0} vs mes anterior`],
        ['Proyectos en Ejecución Activos', `${data.proyectosActivos || 0} proyectos`, `${data.proyectosTerminanPronto || 0} finalizan en los próximos 30 días`],
    ];

    kpiRows.forEach((row, i) => {
        const rIndex = 7 + i;
        const rowObj = wsSummary.getRow(rIndex);
        rowObj.getCell(2).value = row[0];
        rowObj.getCell(3).value = row[1];
        rowObj.getCell(4).value = row[2];

        rowObj.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
        rowObj.getCell(3).alignment = { vertical: 'middle', horizontal: 'right' };
        rowObj.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };

        [2, 3, 4].forEach(col => {
            rowObj.getCell(col).border = {
                top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
        });
        rowObj.height = 20;
    });

    // -------------------------------------------------------------
    // Sección: Evolución Histórica de Ingresos vs Egresos
    // -------------------------------------------------------------
    const startHistory = 14;
    wsSummary.getCell(`B${startHistory}`).value = 'HISTÓRICO INGRESOS VS EGRESOS (ÚLTIMOS 8 MESES)';
    wsSummary.getCell(`B${startHistory}`).font = { bold: true, size: 11, color: { argb: 'FF1E293B' } };

    const histHeaders = ['MES', 'INGRESOS (S/)', 'EGRESOS (S/)', 'RESULTADO OPERATIVO (S/)'];
    ['B', 'C', 'D', 'E'].forEach((col, idx) => {
        const cell = wsSummary.getCell(`${col}${startHistory + 1}`);
        cell.value = histHeaders[idx];
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } }; // Slate 600
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    wsSummary.getRow(startHistory + 1).height = 22;

    (data.ingresosVsEgresos || []).forEach((item, idx) => {
        const rIndex = startHistory + 2 + idx;
        const row = wsSummary.getRow(rIndex);
        const ing = Number(item.ingresos || 0) * 1000;
        const egr = Number(item.egresos || 0) * 1000;
        const balance = ing - egr;

        row.getCell(2).value = item.name;
        row.getCell(3).value = ing;
        row.getCell(4).value = egr;
        row.getCell(5).value = balance;

        row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell(3).alignment = { vertical: 'middle', horizontal: 'right' };
        row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' };
        row.getCell(5).alignment = { vertical: 'middle', horizontal: 'right' };

        row.getCell(3).numFmt = '"S/" #,##0.00';
        row.getCell(4).numFmt = '"S/" #,##0.00';
        row.getCell(5).numFmt = '"S/" #,##0.00';

        [2, 3, 4, 5].forEach(col => {
            row.getCell(col).border = {
                top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
        });
        row.height = 19;
    });

    // -------------------------------------------------------------
    // HOJA 2: DETALLE DE PROYECTOS RECIENTES
    // -------------------------------------------------------------
    const wsProjects = workbook.addWorksheet('Proyectos Recientes', {
        views: [{ state: 'frozen', ySplit: 1 }]
    });

    wsProjects.columns = [
        { header: 'CÓDIGO', key: 'code', width: 18 },
        { header: 'TÍTULO DEL PROYECTO', key: 'title', width: 45 },
        { header: 'CLIENTE', key: 'clientName', width: 35 },
        { header: 'FECHA INICIO', key: 'startDate', width: 16 },
        { header: 'FECHA FIN', key: 'endDate', width: 16 },
        { header: 'ESTADO', key: 'status', width: 18 }
    ];

    const pHeaderRow = wsProjects.getRow(1);
    pHeaderRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    pHeaderRow.height = 26;

    (data.proyectosRecientes || []).forEach(p => {
        const row = wsProjects.addRow({
            code: p.code,
            title: p.title,
            clientName: p.clientName,
            startDate: p.startDate ? new Date(p.startDate).toLocaleDateString('es-PE') : '-',
            endDate: p.endDate ? new Date(p.endDate).toLocaleDateString('es-PE') : '-',
            status: p.status
        });

        row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
        row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
        row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };

        row.eachCell(cell => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
        });
        row.height = 20;
    });

    // Write file
    const buffer = await workbook.xlsx.writeBuffer();
    const dateStr = new Date().toISOString().slice(0, 10);
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Reporte_Dashboard_SEPI_SAC_${dateStr}.xlsx`);
};
