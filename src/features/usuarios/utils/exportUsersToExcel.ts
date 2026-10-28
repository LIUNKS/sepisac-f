import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { UserResponseDTO } from '../types';

export const exportUsersToExcel = async (users: UserResponseDTO[]) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SEPI S.A.C.';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Usuarios', {
        views: [{ state: 'frozen', ySplit: 1 }]
    });

    worksheet.columns = [
        { header: 'NOMBRE COMPLETO', key: 'fullName', width: 32 },
        { header: 'USUARIO', key: 'username', width: 20 },
        { header: 'CORREO ELECTRÓNICO', key: 'email', width: 32 },
        { header: 'ROL', key: 'roleName', width: 22 },
        { header: 'ESTADO', key: 'status', width: 16 },
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

    users.forEach((u) => {
        const row = worksheet.addRow({
            fullName: u.fullName,
            username: u.username ? `@${u.username}` : '-',
            email: u.email,
            roleName: u.roleName?.replace('ROLE_', '') || '-',
            status: u.isActive ? 'Activo' : 'Inactivo',
            companyName: u.companyName || 'SEPI S.A.C.',
            createdAt: formatDate(u.createdAt),
        });

        row.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
            cell.alignment = { vertical: 'middle' };

            // Usuario, Rol, Estado y Fecha centrados
            if (colNumber === 2 || colNumber === 4 || colNumber === 5 || colNumber === 7) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }

            // Estado (columna 5)
            if (colNumber === 5) {
                if (u.isActive) {
                    cell.font = { color: { argb: 'FF16A34A' }, bold: true };
                } else {
                    cell.font = { color: { argb: 'FFDC2626' }, bold: true };
                }
            }
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    saveAs(blob, `Usuarios_SEPI_${dateStr}.xlsx`);
};
