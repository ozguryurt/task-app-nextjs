import Link from 'next/link';
import { Layers3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE_INFO } from '@/lib/site-info';
import { cn } from '@/lib/utils';

/**
 * Ana sayfanın üst menüsü.
 */
export function SiteHeader({ className }: { className?: string }) {
    return (
        <header className={cn('motion-reveal sticky top-0 z-30 border-b border-border/70 bg-card/80 backdrop-blur-xl', className)}>
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
                <Link href="/" className="group flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_6px_16px_rgba(55,70,180,0.24)] transition-transform duration-300 ease-out group-hover:rotate-3 group-hover:scale-105">
                        <Layers3 className="size-4" />
                    </span>
                    <span className="text-[15px] font-semibold tracking-[-0.025em]">{SITE_INFO.brand}</span>
                </Link>
                <nav className="flex items-center gap-1 sm:gap-2">
                    <Button variant="ghost" size="sm" asChild><Link href="/giris">Giriş yap</Link></Button>
                    <Button size="sm" asChild><Link href="/kayit">Ücretsiz başla</Link></Button>
                </nav>
            </div>
        </header>
    );
}
