import { z } from 'zod';

export const machinerySchema = z.object({
    code: z.string()
        .min(2, 'El código debe tener al menos 2 caracteres')
        .max(50, 'Máximo 50 caracteres'),
    name: z.string()
        .min(1, 'El nombre del equipo es obligatorio')
        .max(150, 'Máximo 150 caracteres'),
    status: z.enum(['DISPONIBLE', 'EN_USO', 'EN_MANTENIMIENTO', 'DE_BAJA'], {
        required_error: 'El estado es obligatorio',
        invalid_type_error: 'Estado inválido'
    }),
    lastMaintenanceDate: z.string().optional(),
    nextMaintenanceDate: z.string().optional(),
    companyId: z.string().optional(),
});

export type MachineryFormValues = z.infer<typeof machinerySchema>;
