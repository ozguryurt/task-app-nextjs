import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, isTokenValid, isValidPassword } from '@/lib/auth-helpers';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, newPassword } = body;

        // Validasyon kontrolü
        if (!token || !newPassword) {
            return NextResponse.json(
                { success: false, message: 'Token ve yeni şifre gereklidir' },
                { status: 400 }
            );
        }

        // Şifre güvenlik kontrolü
        if (!isValidPassword(newPassword)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Şifre en az 8 karakter olmalı ve büyük harf, küçük harf ve rakam içermelidir'
                },
                { status: 400 }
            );
        }

        // Token ile kullanıcıyı bul (SQL Injection korumalı)
        const [users] = await pool.query<RowDataPacket[]>(
            `SELECT id, email, password, password_reset_expires 
       FROM users 
       WHERE password_reset_token = ?`,
            [token]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Geçersiz şifre sıfırlama token\'ı' },
                { status: 404 }
            );
        }

        const user = users[0];

        // Token süresi dolmuş mu kontrol et
        if (!isTokenValid(user.password_reset_expires)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Şifre sıfırlama token\'ının süresi dolmuş. Lütfen yeni bir talep oluşturun'
                },
                { status: 410 }
            );
        }

        // Yeni şifre eski şifre ile aynı mı kontrol et
        const newHashedPassword = hashPassword(newPassword);
        if (user.password === newHashedPassword) {
            return NextResponse.json(
                { success: false, message: 'Yeni şifre eski şifreniz ile aynı olamaz' },
                { status: 400 }
            );
        }

        // Şifreyi güncelle ve token'ı temizle (SQL Injection korumalı)
        await pool.query(
            `UPDATE users 
       SET password = ?, 
           password_reset_token = NULL, 
           password_reset_expires = NULL 
       WHERE id = ?`,
            [newHashedPassword, user.id]
        );

        return NextResponse.json(
            {
                success: true,
                message: 'Şifreniz başarıyla güncellendi! Artık yeni şifrenizle giriş yapabilirsiniz.',
                data: {
                    email: user.email
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Şifre sıfırlama hatası:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Şifre sıfırlama sırasında bir hata oluştu',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// Token doğrulama endpoint'i (şifre sıfırlama sayfasında token geçerliliğini kontrol etmek için)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Token gereklidir' },
                { status: 400 }
            );
        }

        // Token ile kullanıcıyı bul (SQL Injection korumalı)
        const [users] = await pool.query<RowDataPacket[]>(
            `SELECT id, email, password_reset_expires 
       FROM users 
       WHERE password_reset_token = ?`,
            [token]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Geçersiz token', valid: false },
                { status: 404 }
            );
        }

        const user = users[0];

        // Token süresi dolmuş mu kontrol et
        if (!isTokenValid(user.password_reset_expires)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Token\'ın süresi dolmuş',
                    valid: false
                },
                { status: 410 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Token geçerli',
                valid: true,
                data: {
                    email: user.email
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Token doğrulama hatası:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Token doğrulama sırasında bir hata oluştu',
                valid: false,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

