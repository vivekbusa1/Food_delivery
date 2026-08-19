import { z } from 'zod';

export const foodVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Variant name is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
});

export const foodAddOnSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Add-on name is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
});

export const foodSchema = z.object({
  categoryId: z.string().min(1, 'Select a category'),
  name: z.string().min(2, 'Food name is required'),
  description: z.string().max(500, 'Keep it under 500 characters').optional(),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  discountPercent: z.coerce.number().min(0).max(100, 'Must be between 0 and 100'),
  isVeg: z.boolean(),
  isAvailable: z.boolean(),
  variants: z.array(foodVariantSchema).default([]),
  addOns: z.array(foodAddOnSchema).default([]),
  tags: z.array(z.string()).default([]),
});

export type FoodFormValues = z.infer<typeof foodSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().max(200, 'Keep it under 200 characters').optional(),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
