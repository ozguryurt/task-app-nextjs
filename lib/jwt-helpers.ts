import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

const JWT_ISSUER = 'taskflow';
const JWT_AUDIENCE = 'taskflow-web';

export interface AuthTokenPayload extends jwt.JwtPayload {
    userId: number;
    email: string;
    name: string;
    sessionVersion: number;
}

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32 || secret === 'default-secret-key-change-this') {
        throw new Error('JWT_SECRET en az 32 karakterlik güçlü bir değer olmalıdır');
    }

    return secret;
}

// JWT Token oluştur
export function signJWT(payload: object, expiresIn: string = '7d'): string {
    return jwt.sign(payload, getJwtSecret(), {
        algorithm: 'HS256',
        audience: JWT_AUDIENCE,
        issuer: JWT_ISSUER,
        expiresIn,
    } as jwt.SignOptions);
}

// JWT Token doğrula (Node.js Runtime)
export async function verifyJWT(token: string): Promise<{ valid: boolean; payload?: AuthTokenPayload; error?: string }> {
    try {
        const payload = jwt.verify(token, getJwtSecret(), {
            algorithms: ['HS256'],
            audience: JWT_AUDIENCE,
            issuer: JWT_ISSUER,
        });

        if (
            typeof payload === 'string' ||
            !Number.isSafeInteger(payload.userId) ||
            !Number.isSafeInteger(payload.sessionVersion) ||
            typeof payload.email !== 'string' ||
            typeof payload.name !== 'string'
        ) {
            return { valid: false, error: 'Geçersiz token içeriği' };
        }

        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT is_active, session_version FROM users WHERE id = ? LIMIT 1',
            [payload.userId]
        );

        if (
            users.length === 0 ||
            !users[0].is_active ||
            users[0].session_version !== payload.sessionVersion
        ) {
            return { valid: false, error: 'Oturum artık geçerli değil' };
        }

        return { valid: true, payload: payload as AuthTokenPayload };
    } catch (error: unknown) {
        if (error instanceof jwt.TokenExpiredError) {
            return { valid: false, error: 'Token süresi dolmuş' };
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return { valid: false, error: 'Geçersiz token' };
        }
        return { valid: false, error: 'Token doğrulama hatası' };
    }
}

