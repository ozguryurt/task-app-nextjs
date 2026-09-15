export const AUTH_CONFIG = {
    // Giriş gerekli olan route'lar
    protectedRoutes: [
        '/panel',
        '/profil',
        '/ayarlar',
        '/gorevler',
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
    ],

    // Giriş sonrası yönlendirilecek sayfa
    redirects: {
        afterLogin: '/panel',
        afterLogout: '/giris',
        loginPage: '/giris',
    },
} as const;

export type AuthConfig = typeof AUTH_CONFIG;

