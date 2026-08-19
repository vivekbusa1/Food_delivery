import { z } from 'zod';

export const profileSchema = z.object({
  restaurantName: z.string().min(2, 'Restaurant name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .max(15, 'Enter a valid phone number'),
  description: z.string().max(500, 'Keep it under 500 characters').optional(),
  cuisineTypes: z.array(z.string()).min(1, 'Select at least one cuisine'),
  minOrderValue: z.coerce.number().min(0, 'Must be 0 or more'),
  avgPreparationTime: z.coerce.number().min(1, 'Must be at least 1 minute'),
  address: z.object({
    line1: z.string().min(2, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().min(4, 'Enter a valid pincode'),
    country: z.string().min(2, 'Country is required'),
  }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const businessDetailsSchema = z.object({
  gstNumber: z
    .string()
    .regex(/^[0-9A-Z]{15}$/, 'Enter a valid 15-character GST number')
    .optional()
    .or(z.literal('')),
  fssaiLicense: z
    .string()
    .regex(/^[0-9]{14}$/, 'Enter a valid 14-digit FSSAI license number')
    .optional()
    .or(z.literal('')),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Enter a valid PAN number')
    .optional()
    .or(z.literal('')),
  bankDetails: z.object({
    accountHolderName: z.string().min(2, 'Account holder name is required'),
    accountNumber: z
      .string()
      .min(6, 'Enter a valid account number')
      .max(20, 'Enter a valid account number'),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code'),
    bankName: z.string().min(2, 'Bank name is required'),
  }),
});

export type BusinessDetailsFormValues = z.infer<typeof businessDetailsSchema>;
