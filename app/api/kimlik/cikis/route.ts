import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // JWT cookie'sini temizle
        const response = NextResponse.json(
            { success: true, message: 'Çıkış başarılı' },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                },
            }
        );

        // httpOnly cookie'yi sil
        response.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            expires: new Date(0),
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Çıkış sırasında bir hata oluştu' },
            { status: 500 }
        );
    }
}

