import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_CONFIG } from '@/lib/middleware/auth-config';
import { verifyJWT } from '@/lib/jwt-helpers';


const { protectedRoutes, authRoutes, publicRoutes } = AUTH_CONFIG;

// Route kontrolü fonksiyonları
function isProtectedRoute(pathname: string): boolean {
    return protectedRoutes.some(route => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
    return authRoutes.some(route => pathname === route);
}

function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route => pathname === route);
}

// Cookie'den JWT token'ı kontrol eder ve doğrular
function isAuthenticated(request: NextRequest): boolean {
    // Auth cookie'sinden JWT token'ı al
    const authToken = request.cookies.get('auth-token');

    if (!authToken?.value) {
        return false;
    }

    // JWT token'ı doğrula
    const verification = verifyJWT(authToken.value);

    return verification.valid;
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // API route'larını middleware'den geçirme
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Static dosyaları middleware'den geçirme
    if (
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/static/') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    const isUserAuthenticated = isAuthenticated(request);

    // Korumalı route kontrolü
    if (isProtectedRoute(pathname)) {
        if (!isUserAuthenticated) {
            // Giriş yapmamış, login sayfasına yönlendir
            const loginUrl = new URL('/giris', request.url);
            loginUrl.searchParams.set('yonlendir', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Auth route kontrolü (giriş/kayıt sayfaları)
    if (isAuthRoute(pathname)) {
        if (isUserAuthenticated) {
            // Zaten giriş yapmış, dashboard'a yönlendir
            const dashboardUrl = new URL('/panel', request.url);
            return NextResponse.redirect(dashboardUrl);
        }
    }

    // Public route veya diğer durumlar
    return NextResponse.next();
}

// Middleware config
export const config = {
    matcher: [
        /*
         * Aşağıdakiler HARİÇ tüm routelarda çalışır:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ]
};

