import { z } from 'zod';

// E-posta validasyon şeması
const emailSchema = z
    .string()
    .min(1, 'E-posta adresi gereklidir')
    .email('Geçerli bir e-posta adresi giriniz');

// Şifre kontrolü (Minimum 8 karakter, en az 1 büyük harf, 1 küçük harf, 1 rakam)
const passwordSchema = z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .refine((password) => new TextEncoder().encode(password).length <= 72, 'Şifre en fazla 72 byte olabilir')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir');

// Giriş formu validasyon şeması
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Şifre gereklidir'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Kayıt formu validasyon şeması
export const registerSchema = z
    .object({
        name: z
            .string()
            .min(2, 'Ad en az 2 karakter olmalıdır')
            .max(255, 'Ad en fazla 255 karakter olabilir'),
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Şifre tekrarı gereklidir'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Şifreler eşleşmiyor',
        path: ['confirmPassword'],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Şifremi unuttum formu validasyon şeması
export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Şifre sıfırlama formu validasyon şeması
export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Şifre tekrarı gereklidir'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Şifreler eşleşmiyor',
        path: ['confirmPassword'],
    });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// E-posta doğrulama formu validasyon şeması
export const resendVerificationSchema = z.object({
    email: emailSchema,
});

export type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>;

