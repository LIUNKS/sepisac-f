import { z } from 'zod';

const envSchema = z.object({
    VITE_API_BASE_URL: z.string({
        required_error: 'La variable de entorno VITE_API_BASE_URL es obligatoria.',
    }).url({
        message: 'VITE_API_BASE_URL debe ser una URL válida',
    }),
});

export const env = envSchema.parse({
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
});