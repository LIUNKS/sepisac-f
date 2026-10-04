import { z } from 'zod';

export const employeeSchema = z.object({
    fullName: z.string().min(1, 'El nombre completo es obligatorio').max(150, 'Máximo 150 caracteres'),
    specialty: z.string().min(1, 'La especialidad es obligatoria').max(100, 'Máximo 100 caracteres'),
    contractType: z.enum(['PLANILLA', 'LOCACION'], {
        required_error: 'El tipo de contrato es obligatorio',
        invalid_type_error: 'Debe ser PLANILLA o LOCACION'
    }),
    baseSalary: z.coerce.number().min(0, 'El sueldo base no puede ser negativo'),
    currentHourlyCost: z.coerce.number().min(0, 'El costo por hora no puede ser negativo'),
    userId: z.string().optional(),
    companyId: z.string().optional()
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
