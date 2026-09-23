import crypto from 'crypto';

export function normalizeEmail(value: unknown): string {
    return typeof value === 'string' ? value.trim().toLocaleLowerCase('en-US') : '';
}

export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

function getCodeSecret(): string {
    const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('OTP_SECRET veya JWT_SECRET en az 32 karakter olmalıdır');
    }
    return secret;
}

export type OneTimeCodePurpose = 'email-verification' | 'password-reset' | 'profile-email-change';

export function hashOneTimeCode(email: string, purpose: OneTimeCodePurpose, code: string): string {
    return crypto
        .createHmac('sha256', getCodeSecret())
        .update(`${purpose}:${normalizeEmail(email)}:${code}`, 'utf8')
        .digest('hex');
}

export function verifyOneTimeCode(
    storedHash: string,
    email: string,
    purpose: OneTimeCodePurpose,
    code: string
): boolean {
    if (!/^[a-f0-9]{64}$/i.test(storedHash)) return false;
    const candidate = Buffer.from(hashOneTimeCode(email, purpose, code), 'hex');
    const stored = Buffer.from(storedHash, 'hex');
    return crypto.timingSafeEqual(candidate, stored);
}

export function escapeHtml(value: string): string {
    return value.replace(/[&<>'"]/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
    })[character] as string);
}
