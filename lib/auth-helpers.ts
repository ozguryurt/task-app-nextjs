// Auth Helper Functions - Node.js Runtime (API Routes için)
import crypto from 'crypto';
import * as argon2 from 'argon2';

const ARGON2_OPTIONS: argon2.HashOptions & { raw: false } = {
    raw: false,
    type: argon2.argon2id,
    memoryCost: 19 * 1024,
    timeCost: 2,
    parallelism: 1,
};

const LEGACY_SHA256_PATTERN = /^[a-f0-9]{64}$/i;

// Parolaları rastgele salt içeren, bellek maliyetli Argon2id ile hashle.
export async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password, ARGON2_OPTIONS);
}

export function isLegacyPasswordHash(storedHash: string): boolean {
    return LEGACY_SHA256_PATTERN.test(storedHash);
}

export async function verifyPassword(
    password: string,
    storedHash: string
): Promise<{ isValid: boolean; needsRehash: boolean }> {
    if (isLegacyPasswordHash(storedHash)) {
        const candidateHash = crypto.createHash('sha256').update(password).digest();
        const storedHashBuffer = Buffer.from(storedHash, 'hex');
        const isValid = crypto.timingSafeEqual(candidateHash, storedHashBuffer);

        return { isValid, needsRehash: isValid };
    }

    if (!storedHash.startsWith('$argon2id$')) {
        return { isValid: false, needsRehash: false };
    }

    try {
        const isValid = await argon2.verify(storedHash, password);
        const needsRehash = isValid && argon2.needsRehash(storedHash, ARGON2_OPTIONS);

        return { isValid, needsRehash };
    } catch {
        return { isValid: false, needsRehash: false };
    }
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
