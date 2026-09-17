// Auth Helper Functions - Node.js Runtime (API Routes için)
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const BCRYPT_COST = 12;
const LEGACY_SHA256_PATTERN = /^[a-f0-9]{64}$/i;
const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$/;

// Parolaları benzersiz salt ve ayarlanabilir maliyet faktörüyle bcrypt kullanarak hashle.
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_COST);
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

    if (!BCRYPT_PATTERN.test(storedHash)) {
        return { isValid: false, needsRehash: false };
    }

    try {
        const isValid = await bcrypt.compare(password, storedHash);
        const needsRehash = isValid && bcrypt.getRounds(storedHash) !== BCRYPT_COST;

        return { isValid, needsRehash };
    } catch {
        return { isValid: false, needsRehash: false };
    }
}

export function generateVerificationCode(): string {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function isValidVerificationCode(code: string): boolean {
    return /^\d{6}$/.test(code);
}

// E-posta formatını doğrula
export function isValidEmail(email: string): boolean {
    if (email.length > 254) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Şifre kontrolü (Minimum 8 karakter, en az 1 büyük harf, 1 küçük harf, 1 rakam)
export function isValidPassword(password: string): boolean {
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) return false;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber;
}

export function getCodeExpiry(minutes: number = 5): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
}

// Tek kullanımlık kodun geçerlilik süresini kontrol et.
export function isExpiryValid(expiryDate: Date | null): boolean {
    if (!expiryDate) return false;
    return new Date() < new Date(expiryDate);
}
