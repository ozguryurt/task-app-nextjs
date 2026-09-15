import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isTokenValid } from '@/lib/auth-helpers';
import { RowDataPacket } from 'mysql2';
import { sendVerificationEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Doğrulama token\'ı gereklidir' },
                { status: 400 }
            );
        }

        // Token ile kullanıcıyı bul (SQL Injection korumalı)
        const [users] = await pool.query<RowDataPacket[]>(
            `SELECT id, email, email_verified, email_verification_expires 
       FROM users 
       WHERE email_verification_token = ?`,
            [token]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Geçersiz doğrulama token\'ı' },
                { status: 404 }
            );
        }

        const user = users[0];

        // Zaten doğrulanmış mı kontrol et
        if (user.email_verified) {
            return NextResponse.json(
                { success: true, message: 'E-posta adresi zaten doğrulanmış' },
                { status: 200 }
            );
        }

        // Token süresi dolmuş mu kontrol et
        if (!isTokenValid(user.email_verification_expires)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Doğrulama token\'ının süresi dolmuş. Lütfen yeni bir doğrulama e-postası talep edin'
                },
                { status: 410 }
            );
        }

        // E-posta adresini doğrulanmış olarak işaretle (SQL Injection korumalı)
        await pool.query(
            `UPDATE users 
       SET email_verified = TRUE, 
           email_verification_token = NULL, 
           email_verification_expires = NULL 
       WHERE id = ?`,
            [user.id]
        );

        return NextResponse.json(
            {
                success: true,
                message: 'E-posta adresiniz başarıyla doğrulandı! Artık giriş yapabilirsiniz.',
                data: {
                    email: user.email
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('E-posta doğrulama hatası:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'E-posta doğrulama sırasında bir hata oluştu',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// Yeni doğrulama e-postası gönder
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'E-posta adresi gereklidir' },
                { status: 400 }
            );
        }

        // Kullanıcıyı bul (SQL Injection korumalı)
        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT id, email, name, email_verified FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı' },
                { status: 404 }
            );
        }

        const user = users[0];

        if (user.email_verified) {
            return NextResponse.json(
                { success: true, message: 'E-posta adresi zaten doğrulanmış' },
                { status: 200 }
            );
        }

        // Yeni token oluştur
        const { generateToken, getTokenExpiry } = await import('@/lib/auth-helpers');
        const verificationToken = generateToken();
        const verificationExpiry = getTokenExpiry(24);

        // Token'ı güncelle (SQL Injection korumalı)
        await pool.query(
            `UPDATE users 
       SET email_verification_token = ?, 
           email_verification_expires = ? 
       WHERE id = ?`,
            [verificationToken, verificationExpiry, user.id]
        );

        const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/eposta-dogrulama?token=${verificationToken}`;

        try {
            await sendVerificationEmail({
                to: user.email,
                name: user.name || user.email,
                verificationLink,
            });
        } catch (emailError) {
            console.error('Doğrulama e-postası gönderilemedi:', emailError);
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Yeni doğrulama e-postası gönderildi',
                data: {
                    verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Doğrulama e-postası gönderme hatası:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Doğrulama e-postası gönderilirken bir hata oluştu',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

