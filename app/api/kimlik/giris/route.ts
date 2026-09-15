import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, isValidEmail, verifyPassword } from '@/lib/auth-helpers';
import { signJWT } from '@/lib/jwt-helpers';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validasyon kontrolü
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'E-posta ve şifre gereklidir' },
                { status: 400 }
            );
        }

        // E-posta format kontrolü
        if (!isValidEmail(email)) {
            return NextResponse.json(
                { success: false, message: 'Geçersiz e-posta formatı' },
                { status: 400 }
            );
        }

        // Kullanıcıyı e-posta ile bul; parola uygulama katmanında güvenli biçimde doğrulanır.
        const [users] = await pool.query<RowDataPacket[]>(
            `SELECT id, email, password, name, email_verified, is_active, created_at 
       FROM users 
       WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, message: 'E-posta veya şifre hatalı' },
                { status: 401 }
            );
        }

        const user = users[0];

        const passwordVerification = await verifyPassword(password, user.password);
        if (!passwordVerification.isValid) {
            return NextResponse.json(
                { success: false, message: 'E-posta veya şifre hatalı' },
                { status: 401 }
            );
        }

        // Eski SHA-256 kayıtlarını ve düşük maliyetli bcrypt hash'lerini başarılı girişte yükselt.
        if (passwordVerification.needsRehash) {
            const upgradedHash = await hashPassword(password);
            await pool.query('UPDATE users SET password = ? WHERE id = ?', [upgradedHash, user.id]);
        }

        // Hesap aktif mi kontrol et
        if (!user.is_active) {
            return NextResponse.json(
                { success: false, message: 'Hesabınız devre dışı bırakılmış' },
                { status: 403 }
            );
        }

        // E-posta doğrulanmış mı kontrol et
        if (!user.email_verified) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Lütfen önce e-posta adresinizi doğrulayın',
                    requiresVerification: true
                },
                { status: 403 }
            );
        }

        // JWT Token oluştur
        const token = signJWT(
            {
                userId: user.id,
                email: user.email,
                name: user.name
            },
            '7d' // 7 gün geçerli
        );

        // Response oluştur
        const response = NextResponse.json(
            {
                success: true,
                message: 'Giriş başarılı',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        emailVerified: user.email_verified,
                        createdAt: user.created_at
                    }
                }
            },
            { status: 200 }
        );

        // JWT Token'ı httpOnly cookie olarak set et
        response.cookies.set('auth-token', token, {
            httpOnly: true, // XSS saldırılarına karşı koruma
            secure: process.env.NODE_ENV === 'production', // HTTPS'de çalış
            sameSite: 'lax', // CSRF koruması
            maxAge: 60 * 60 * 24 * 7, // 7 gün (saniye cinsinden)
            path: '/'
        });

        return response;

    } catch (error: any) {
        console.error('Giriş hatası:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Giriş sırasında bir hata oluştu',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

