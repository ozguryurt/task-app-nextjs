import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, generateToken, isValidEmail, isValidPassword, getTokenExpiry } from '@/lib/auth-helpers';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        // Validasyon kontrolü
        if (!email || !password || !name) {
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
                    message: 'Şifre en az 8 karakter olmalı ve büyük harf, küçük harf ve rakam içermelidir'
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
        const hashedPassword = hashPassword(password);

        // E-posta doğrulama token'ı oluştur
        const verificationToken = generateToken();
        const verificationExpiry = getTokenExpiry(24); // 24 saat geçerli

        // Kullanıcıyı veritabanına ekle (SQL Injection korumalı - Prepared Statement)
        const [result] = await pool.query(
            `INSERT INTO users 
        (email, password, name, email_verification_token, email_verification_expires) 
       VALUES (?, ?, ?, ?, ?)`,
            [email, hashedPassword, name, verificationToken, verificationExpiry]
        );

        // TODO: Burada e-posta gönderme servisi entegre edilecek
        // Örnek doğrulama linki: ${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verificationToken}

        return NextResponse.json(
            {
                success: true,
                message: 'Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.',
                data: {
                    userId: (result as any).insertId,
                    verificationToken // Geliştirme aşamasında görmek için (production'da kaldırılmalı)
                }
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Kayıt hatası:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Kayıt sırasında bir hata oluştu',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

