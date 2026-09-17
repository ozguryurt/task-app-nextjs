import Link from 'next/link';
import { Layers3 } from 'lucide-react';
import { SITE_INFO } from '@/lib/site-info';
import { cn } from '@/lib/utils';

const productLinks = [
    { href: '/#ozellikler', label: 'Özellikler' },
    { href: '/giris', label: 'Giriş yap' },
    { href: '/kayit', label: 'Ücretsiz kayıt ol' },
];

/**
 * Ana sayfanın alt bilgisi. Marka ve ürün bağlantılarını gösterir.
 */
export function SiteFooter({ className }: { className?: string }) {
    return (
        <footer className={cn('border-t border-border bg-card', className)}>
            <div className="mx-auto grid max-w-6xl gap-7 px-5 py-9 sm:px-8 md:grid-cols-[1.5fr_1fr]">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <Layers3 className="size-4" />
                        </span>
                        <span className="text-sm font-bold tracking-tight">{SITE_INFO.brand}</span>
                    </div>
                    <p className="mt-3 max-w-xs text-xs leading-6 text-muted-foreground">
                        Ekipler için görev takibi, rol yönetimi ve ilerleme görünürlüğü. Hepsi tek bir çalışma alanında.
                    </p>
                </div>

                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/80">Ürün</h3>
                    <ul className="mt-4 space-y-2.5">
                        {productLinks.map((link) => (
                            <li key={link.href} className="transition-transform duration-200 hover:translate-x-0.5">
                                <Link
                                    href={link.href}
                                    className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-t border-border">
                <div className="mx-auto flex max-w-6xl flex-col gap-1.5 px-5 py-4 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <p>© {new Date().getFullYear()} {SITE_INFO.brand}. Tüm hakları saklıdır.</p>
                    <p>Ekip ve görev yönetimi uygulaması.</p>
                </div>
            </div>
        </footer>
    );
}

