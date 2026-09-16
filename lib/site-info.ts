/**
 * Site genelinde (üst menü, alt bilgi) kullanılan marka bilgisi.
 */

const DEFAULTS = {
    brand: 'Taskflow',
} as const;

export const SITE_INFO = {
    /** Arayüzde görünen marka adı */
    brand: DEFAULTS.brand,
} as const;
