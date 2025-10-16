import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-this';

// JWT Token oluştur
export function signJWT(payload: object, expiresIn: string = '7d'): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

// JWT Token doğrula (Node.js Runtime)
export function verifyJWT(token: string): { valid: boolean; payload?: any; error?: string } {
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        return { valid: true, payload };
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return { valid: false, error: 'Token süresi dolmuş' };
        }
        if (error.name === 'JsonWebTokenError') {
            return { valid: false, error: 'Geçersiz token' };
        }
        return { valid: false, error: 'Token doğrulama hatası' };
    }
}

