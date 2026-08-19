import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number")
      .max(15, "Enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignupFormValues = z.infer<typeof signupSchema>;

export const otpSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code"),
});
export type OtpFormValues = z.infer<typeof otpSchema>;

export const editProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
});
export type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  addressLine1: z.string().trim().min(1, "Address is required"),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().min(1, "Country is required"),
  instructions: z.string().trim().optional(),
  latitude: z.number(),
  longitude: z.number(),
});
export type AddressFormValues = z.infer<typeof addressSchema>;

export const couponSchema = z.object({
  code: z.string().trim().min(1, "Enter a coupon code"),
});
export type CouponFormValues = z.infer<typeof couponSchema>;

export const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().trim().min(3, "Please write at least a few words"),
});
export type ReviewFormValues = z.infer<typeof reviewSchema>;
