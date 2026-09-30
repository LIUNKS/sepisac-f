import { z } from 'zod';

export const companyCreateSchema = z.object({
    businessName: z.string().min(1, 'La razón social es obligatoria').max(150, 'Máximo 150 caracteres'),
    ruc: z.string().regex(/^\d{11}$/, 'El RUC debe contener exactamente 11 dígitos numéricos'),
    subscriptionStatus: z.enum(['ACTIVE', 'SUSPENDED', 'TRIAL']).optional().default('ACTIVE')
});

export type CompanyFormValues = z.infer<typeof companyCreateSchema>;
