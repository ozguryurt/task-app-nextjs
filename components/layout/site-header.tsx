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
        <header className={cn('motion-reveal relative z-20 border-b border-border bg-card/90 backdrop-blur-md', className)}>
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
                <Link href="/" className="group flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-transform duration-300 ease-out group-hover:rotate-3 group-hover:scale-105">
                        <Layers3 className="size-4" />
                    </span>
                    <span className="text-[15px] font-bold tracking-tight">{SITE_INFO.brand}</span>
                </Link>
                <nav className="flex items-center gap-1 sm:gap-2">
                    <Button variant="ghost" size="sm" asChild><Link href="/giris">Giriş yap</Link></Button>
                    <Button size="sm" asChild><Link href="/kayit">Ücretsiz başla</Link></Button>
                </nav>
            </div>
        </header>
    );
}
