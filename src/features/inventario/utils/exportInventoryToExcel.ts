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
        { header: 'CÓDIGO (SKU)', key: 'sku', width: 18 },
        { header: 'NOMBRE DEL ARTÍCULO', key: 'name', width: 35 },
        { header: 'CATEGORÍA', key: 'category', width: 25 },
        { header: 'UBICACIÓN ALMACÉN', key: 'location', width: 28 },
        { header: 'DESCRIPCIÓN TÉCNICA', key: 'description', width: 35 },
        { header: 'STOCK ACTUAL', key: 'stockQuantity', width: 14 },
        { header: 'UNIDAD', key: 'unit', width: 12 },
        { header: 'STOCK MÍNIMO', key: 'minStockAlert', width: 14 },
        { header: 'ESTADO', key: 'status', width: 15 },
        { header: 'COSTO DE COMPRA', key: 'purchaseCost', width: 18 },
        { header: 'PRECIO DE VENTA', key: 'salePrice', width: 18 },
        { header: 'EMPRESA', key: 'companyName', width: 25 },
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
            category: item.category || 'General',
            location: item.location || 'Almacén Central',
            description: item.description || '-',
            stockQuantity: item.stockQuantity,
            unit: item.unit || 'und',
            minStockAlert: item.minStockAlert,
            status: item.stockQuantity <= 0 ? 'Agotado' : item.isLowStock ? 'Bajo Stock' : 'Normal',
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

            // Formato de moneda para costos y precios (columnas 10 y 11)
            if (colNumber === 10 || colNumber === 11) {
                cell.numFmt = '"S/"#,##0.00';
            }
            
            // Formato condicional simulado para Estado (columna 9)
            if (colNumber === 9) {
                if (item.stockQuantity <= 0) {
                    cell.font = { color: { argb: 'FFB91C1C' }, bold: true }; // Red 700
                } else if (item.isLowStock) {
                    cell.font = { color: { argb: 'FFD97706' }, bold: true }; // Amber 600
                } else {
                    cell.font = { color: { argb: 'FF16A34A' } }; // Green 600
                }
            }
        });
    });

    // Generar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    
    saveAs(blob, `Inventario_SEPI_${dateStr}.xlsx`);
};
