/**
 * Site genelinde (üst menü, alt bilgi) kullanılan marka ve iletişim bilgileri.
 *
 * `NEXT_PUBLIC_SUPPORT_EMAIL` ortam değişkeni ile override edilebilir (bkz. env.example).
 */

const DEFAULTS = {
    brand: 'Taskflow',
    supportEmail: 'destek@taskflow.app',
} as const;

export const SITE_INFO = {
    /** Arayüzde görünen marka adı */
    brand: DEFAULTS.brand,
    /** Alt bilgide gösterilen iletişim adresi */
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || DEFAULTS.supportEmail,
} as const;
