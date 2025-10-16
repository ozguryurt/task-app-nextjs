// Auth Helper Functions - Node.js Runtime (API Routes için)
import crypto from 'crypto';

// SHA256 hash oluştur
export function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Email verification için rastgele token oluşturma
export function generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// E-posta formatını doğrula
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Şifre kontrolü (Minimum 8 karakter, en az 1 büyük harf, 1 küçük harf, 1 rakam)
export function isValidPassword(password: string): boolean {
    if (password.length < 8) return false;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber;
}

// Token son kullanma tarihi oluştur - Email verification için (saat cinsinden)
export function getTokenExpiry(hours: number = 24): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + hours);
    return expiry;
}

// Email verification için tokenin geçerliliğini kontrol et
export function isTokenValid(expiryDate: Date | null): boolean {
    if (!expiryDate) return false;
    return new Date() < new Date(expiryDate);
}
