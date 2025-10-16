export const AUTH_CONFIG = {
    // Giriş gerekli olan route'lar
    protectedRoutes: [
        '/dashboard',
        '/profile',
        '/settings',
        '/tasks',
    ],

    // Giriş yapmış kullanıcılar erişemez olan route'lar
    authRoutes: [
        '/giris',
        '/kayit',
        '/sifremi-unuttum',
    ],

    // Herkes erişebilir olan route'lar
    publicRoutes: [
        '/',
        '/hakkimizda',
        '/iletisim',
        '/sozlesme',
        '/gizlilik',
    ],

    // Giriş sonrası yönlendirilecek sayfa
    redirects: {
        afterLogin: '/dashboard',
        afterLogout: '/giris',
        loginPage: '/giris',
    },
} as const;

export type AuthConfig = typeof AUTH_CONFIG;

