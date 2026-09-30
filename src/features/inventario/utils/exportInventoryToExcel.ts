import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { InventoryItem } from '../types';

export const exportInventoryToExcel = async (items: InventoryItem[]) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SEPI S.A.C.';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Inventario', {
        views: [{ state: 'frozen', ySplit: 1 }] // Congelar la primera fila (cabeceras)
    });

    // Definir columnas
    worksheet.columns = [
        { header: 'CÓDIGO (SKU)', key: 'sku', width: 20 },
        { header: 'NOMBRE DEL ARTÍCULO', key: 'name', width: 40 },
        { header: 'DESCRIPCIÓN / UBICACIÓN', key: 'description', width: 40 },
        { header: 'STOCK ACTUAL', key: 'stockQuantity', width: 15 },
        { header: 'STOCK MÍNIMO', key: 'minStockAlert', width: 15 },
        { header: 'ESTADO', key: 'status', width: 20 },
        { header: 'COSTO DE COMPRA', key: 'purchaseCost', width: 20 },
        { header: 'PRECIO DE VENTA', key: 'salePrice', width: 20 },
        { header: 'EMPRESA', key: 'companyName', width: 30 },
    ];

    // Estilo de la cabecera
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

    // Agregar datos
    items.forEach((item) => {
        const row = worksheet.addRow({
            sku: item.sku,
            name: item.name,
            description: item.description || 'Sin ubicación',
            stockQuantity: item.stockQuantity,
            minStockAlert: item.minStockAlert,
            status: item.isLowStock ? 'Bajo Stock' : 'Normal',
            purchaseCost: item.purchaseCost,
            salePrice: item.salePrice,
            companyName: item.companyName
        });

        row.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
            cell.alignment = { vertical: 'middle' };

            // Formato de moneda para costos y precios (columnas 7 y 8)
            if (colNumber === 7 || colNumber === 8) {
                cell.numFmt = '"S/"#,##0.00';
            }
            
            // Formato condicional simulado para Estado (columna 6)
            if (colNumber === 6) {
                if (item.isLowStock) {
                    cell.font = { color: { argb: 'FFDC2626' }, bold: true }; // Red 600
                } else {
                    cell.font = { color: { argb: 'FF16A34A' } }; // Green 600
                }
            }
        });
    });

    // Generar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Formatear fecha para el nombre del archivo
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    
    saveAs(blob, `Inventario_SEPI_${dateStr}.xlsx`);
};
