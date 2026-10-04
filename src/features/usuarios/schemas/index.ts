import { z } from 'zod';

export const userCreateSchema = z.object({
  email: z.string().email('Formato de correo electrónico inválido').min(1, 'El correo electrónico es obligatorio'),
  username: z.string().optional(),
  fullName: z.string().min(1, 'El nombre completo es obligatorio'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  roleId: z.coerce.number().min(1, 'El rol es obligatorio'),
  companyId: z.string().optional(),
});

export type UserCreateFormValues = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es obligatorio'),
  username: z.string().optional(),
  roleId: z.coerce.number().min(1, 'El rol es obligatorio'),
  companyId: z.string().optional(),
});

export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;
