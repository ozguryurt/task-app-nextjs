import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateVerificationCode, getCodeExpiry, hashPassword, isValidEmail, isValidPassword } from '@/lib/auth-helpers';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { sendVerificationEmail } from '@/lib/email';
import { enforceRateLimit } from '@/lib/rate-limit';
import { hashOneTimeCode, normalizeEmail, rejectOversizedRequest } from '@/lib/security';

export async function POST(request: NextRequest) {
    try {
        const rejectedBody = rejectOversizedRequest(request);
        if (rejectedBody) return rejectedBody;

        const rateLimited = enforceRateLimit(request, {
            scope: 'register',
            limit: 5,
            windowMs: 60 * 60 * 1000,
        });
        if (rateLimited) return rateLimited;

        const body = await request.json();
        const email = normalizeEmail(body.email);
        const password = typeof body.password === 'string' ? body.password : '';
        const name = typeof body.name === 'string' ? body.name.trim() : '';

        // Validasyon kontrolü
        if (!email || !password || !name || name.length > 255) {
            return NextResponse.json(
                { success: false, message: 'Tüm alanları doldurunuz' },
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

        // Şifre güvenlik kontrolü
        if (!isValidPassword(password)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Şifre 8-72 byte arasında olmalı ve büyük harf, küçük harf ve rakam içermelidir'
                },
                { status: 400 }
            );
        }

        // E-posta kullanımda mı kontrol et (SQL Injection korumalı)
        const [existingUsers] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Bu e-posta adresi zaten kullanılıyor' },
                { status: 409 }
            );
        }

        // Şifreyi hashle
        const hashedPassword = await hashPassword(password);

        const verificationCode = generateVerificationCode();
        const verificationExpiry = getCodeExpiry();

        // Kullanıcıyı veritabanına ekle (SQL Injection korumalı - Prepared Statement)
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO users 
        (email, password, name, email_verification_token, email_verification_expires, email_verification_attempts)
       VALUES (?, ?, ?, ?, ?, 0)`,
            [email, hashedPassword, name, hashOneTimeCode(email, 'email-verification', verificationCode), verificationExpiry]
        );

        try {
            await sendVerificationEmail({
                to: email,
                name,
                code: verificationCode,
            });
        } catch (emailError) {
            console.error('Doğrulama e-postası gönderilemedi:', emailError);
        }

        const responseData = {
            userId: result.insertId,
        };

        return NextResponse.json(
            {
                success: true,
                message: 'Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.',
                data: responseData
            },
            { status: 201 }
        );

    } catch (error: unknown) {
        console.error('Kayıt hatası:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Kayıt sırasında bir hata oluştu',
            },
            { status: 500 }
        );
    }
}

