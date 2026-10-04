import { z } from 'zod';

export const paymentSchema = z.object({
    amountPaid: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
    paymentMethod: z.enum(['TRANSFERENCIA', 'EFECTIVO', 'DEPOSITO', 'TARJETA', 'CHEQUE'], {
        required_error: 'Debe seleccionar un método de pago',
    }),
    referenceCode: z.string().optional(),
    currency: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
