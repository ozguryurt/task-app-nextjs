import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // JWT cookie'sini temizle
        const response = NextResponse.json(
            { success: true, message: 'Çıkış başarılı' },
            { status: 200 }
        );

        // httpOnly cookie'yi sil
        response.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // Hemen sil
            path: '/'
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Çıkış sırasında bir hata oluştu' },
            { status: 500 }
        );
    }
}

