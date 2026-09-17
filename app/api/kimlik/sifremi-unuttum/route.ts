import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateVerificationCode, getCodeExpiry, isValidEmail } from '@/lib/auth-helpers';
import type { RowDataPacket } from 'mysql2';
import { sendPasswordResetEmail } from '@/lib/email';
import { enforceRateLimit } from '@/lib/rate-limit';
import { hashOneTimeCode, hashToken, normalizeEmail, rejectOversizedRequest } from '@/lib/security';

const GENERIC_MESSAGE = 'Hesap uygunsa 6 haneli şifre sıfırlama kodu e-posta adresine gönderildi';

export async function POST(request: NextRequest) {
    try {
        const rejectedBody = rejectOversizedRequest(request);
        if (rejectedBody) return rejectedBody;

        const rateLimited = enforceRateLimit(request, {
            scope: 'forgot-password',
            limit: 5,
            windowMs: 15 * 60 * 1000,
        });
        if (rateLimited) return rateLimited;

        const body = await request.json();
        const email = normalizeEmail(body.email);

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

        const accountRateLimited = enforceRateLimit(request, {
            scope: 'forgot-password-account',
            identifier: hashToken(email),
            limit: 3,
            windowMs: 60 * 60 * 1000,
        });
        if (accountRateLimited) return accountRateLimited;

        // Kullanıcıyı bul (SQL Injection korumalı)
        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT id, email, name, email_verified, is_active FROM users WHERE email = ?',
            [email]
        );

        // Güvenlik: Kullanıcı bulunamasa bile başarılı mesajı göster
        // (e-posta adresinin sistemde olup olmadığını gizle)
        if (users.length === 0) {
            return NextResponse.json(
                {
                    success: true,
                    message: GENERIC_MESSAGE
                },
                { status: 200 }
            );
        }

        const user = users[0];

        // Hesap durumunu dışarı sızdırmadan yalnızca uygun hesaplar için kod üret.
        if (!user.is_active || !user.email_verified) {
            return NextResponse.json(
                { success: true, message: GENERIC_MESSAGE },
                { status: 200 }
            );
        }

        const resetCode = generateVerificationCode();
        const resetExpiry = getCodeExpiry();

        // Kod özetini veritabanına kaydet (SQL Injection korumalı)
        await pool.query(
            `UPDATE users 
       SET password_reset_token = ?,
           password_reset_expires = ?,
           password_reset_attempts = 0
       WHERE id = ?`,
            [hashOneTimeCode(email, 'password-reset', resetCode), resetExpiry, user.id]
        );

        try {
            await sendPasswordResetEmail({
                to: user.email,
                name: user.name || user.email,
                code: resetCode,
            });
        } catch (emailError) {
            console.error('Şifre sıfırlama e-postası gönderilemedi:', emailError);
        }

        return NextResponse.json(
            {
                success: true,
                message: GENERIC_MESSAGE,
            },
            { status: 200 }
        );

    } catch (error: unknown) {
        console.error('Şifre sıfırlama talebi hatası:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Şifre sıfırlama talebi sırasında bir hata oluştu',
            },
            { status: 500 }
        );
    }
}

