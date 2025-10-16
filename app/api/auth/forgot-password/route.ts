import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateToken, getTokenExpiry, isValidEmail } from '@/lib/auth-helpers';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        // Validasyon kontrolü
        if (!email) {
            return NextResponse.json(
                { success: false, message: 'E-posta adresi gereklidir' },
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

        // Kullanıcıyı bul (SQL Injection korumalı)
        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT id, email, email_verified, is_active FROM users WHERE email = ?',
            [email]
        );

        // Güvenlik: Kullanıcı bulunamasa bile başarılı mesajı göster
        // (e-posta adresinin sistemde olup olmadığını gizle)
        if (users.length === 0) {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Eğer bu e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi'
                },
                { status: 200 }
            );
        }

        const user = users[0];

        // Hesap aktif değilse
        if (!user.is_active) {
            return NextResponse.json(
                { success: false, message: 'Hesabınız devre dışı bırakılmış' },
                { status: 403 }
            );
        }

        // E-posta doğrulanmamışsa
        if (!user.email_verified) {
            return NextResponse.json(
                { success: false, message: 'Lütfen önce e-posta adresinizi doğrulayın' },
                { status: 403 }
            );
        }

        // Şifre sıfırlama token'ı oluştur
        const resetToken = generateToken();
        const resetExpiry = getTokenExpiry(1); // 1 saat geçerli

        // Token'ı veritabanına kaydet (SQL Injection korumalı)
        await pool.query(
            `UPDATE users 
       SET password_reset_token = ?, 
           password_reset_expires = ? 
       WHERE id = ?`,
            [resetToken, resetExpiry, user.id]
        );

        // TODO: E-posta gönderme servisi
        // Şifre sıfırlama linki: ${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reset-password?token=${resetToken}

        return NextResponse.json(
            {
                success: true,
                message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi',
                data: {
                    resetToken // Geliştirme aşamasında görmek için (production'da kaldırılmalı)
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Şifre sıfırlama talebi hatası:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Şifre sıfırlama talebi sırasında bir hata oluştu',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

