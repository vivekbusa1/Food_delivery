import { z } from 'zod';

export const offerSchema = z
  .object({
    title: z.string().min(2, 'Title is required'),
    description: z.string().max(300, 'Keep it under 300 characters').optional(),
    code: z
      .string()
      .min(3, 'Code must be at least 3 characters')
      .max(20, 'Code must be under 20 characters')
      .regex(/^[A-Z0-9]+$/, 'Use uppercase letters and numbers only'),
    type: z.enum(['percentage', 'flat', 'free_delivery']),
    value: z.coerce.number().min(0, 'Value must be 0 or more'),
    minOrderValue: z.coerce.number().min(0).optional(),
    maxDiscount: z.coerce.number().min(0).optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    usageLimit: z.coerce.number().min(1).optional(),
    isActive: z.boolean(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine((data) => data.type !== 'percentage' || data.value <= 100, {
    message: 'Percentage discount cannot exceed 100',
    path: ['value'],
  });

export type OfferFormValues = z.infer<typeof offerSchema>;
