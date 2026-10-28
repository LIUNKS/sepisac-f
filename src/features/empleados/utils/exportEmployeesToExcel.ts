import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { EmployeeResponseDTO } from '../types';

export const exportEmployeesToExcel = async (employees: EmployeeResponseDTO[]) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SEPI S.A.C.';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Personal', {
        views: [{ state: 'frozen', ySplit: 1 }]
    });

    worksheet.columns = [
        { header: 'NOMBRE COMPLETO', key: 'fullName', width: 30 },
        { header: 'ESPECIALIDAD', key: 'specialty', width: 25 },
        { header: 'TIPO DE CONTRATO', key: 'contractType', width: 20 },
        { header: 'SUELDO BASE (S/)', key: 'baseSalary', width: 18 },
        { header: 'COSTO POR HORA (S/)', key: 'currentHourlyCost', width: 20 },
        { header: 'DISPONIBILIDAD', key: 'status', width: 18 },
        { header: 'USUARIO VINCULADO', key: 'userEmail', width: 28 },
        { header: 'EMPRESA', key: 'companyName', width: 25 },
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

    employees.forEach((emp) => {
        const row = worksheet.addRow({
            fullName: emp.fullName,
            specialty: emp.specialty,
            contractType: emp.contractType === 'PLANILLA' ? 'Planilla' : 'Locación de Servicios',
            baseSalary: emp.baseSalary,
            currentHourlyCost: emp.currentHourlyCost,
            status: emp.isAvailable ? 'Disponible' : 'No Disponible / Asignado',
            userEmail: emp.userEmail || 'Sin vincular',
            companyName: emp.companyName
        });

        row.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
            cell.alignment = { vertical: 'middle' };

            // Formato de moneda para sueldo y costo hora (columnas 4 y 5)
            if (colNumber === 4 || colNumber === 5) {
                cell.numFmt = '"S/"#,##0.00';
            }

            // Estado (columna 6)
            if (colNumber === 6) {
                if (emp.isAvailable) {
                    cell.font = { color: { argb: 'FF16A34A' }, bold: true };
                } else {
                    cell.font = { color: { argb: 'FFD97706' }, bold: true };
                }
            }
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    saveAs(blob, `Personal_Operativo_SEPI_${dateStr}.xlsx`);
};
