'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationItem {
    id: number;
    team_id: number;
    task_id: number | null;
    type: string;
    message: string;
    actor_name: string | null;
    read_at: string | null;
    created_at: string;
}

export function NotificationInbox({ userId }: { userId?: number }) {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await fetch('/api/kullanici/bildirimler', { credentials: 'include', cache: 'no-store' });
            if (!response.ok) throw new Error('Bildirimler yüklenemedi');
            const data = await response.json();
            setItems(data.notifications ?? []);
            setUnreadCount(data.unreadCount ?? 0);
            setError(null);
        } catch {
            setError('Bildirimler yüklenemedi');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
        const initial = window.setTimeout(() => { setLoading(true); void refresh(); }, 0);
        const interval = window.setInterval(() => {
            if (document.visibilityState === 'visible') void refresh();
        }, 60_000);
        const onFocus = () => void refresh();
        window.addEventListener('focus', onFocus);
        return () => {
            window.clearTimeout(initial);
            window.clearInterval(interval);
            window.removeEventListener('focus', onFocus);
        };
    }, [userId, refresh]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const markRead = async (id: number) => {
        const item = items.find((notification) => notification.id === id);
        if (!item) return;
        try {
            const response = await fetch('/api/kullanici/bildirimler', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', body: JSON.stringify({ id }),
            });
            if (!response.ok) throw new Error();
            if (!item.read_at) {
                setItems((current) => current.map((notification) => notification.id === id ? { ...notification, read_at: new Date().toISOString() } : notification));
                setUnreadCount((count) => Math.max(0, count - 1));
            }
            setOpen(false);
            if (item.task_id) router.push(`/panel/takimlar/${item.team_id}/gorevler/${item.task_id}`);
        } catch {
            setError('Bildirim işaretlenemedi');
        }
    };

    const markAllRead = async () => {
        try {
            const response = await fetch('/api/kullanici/bildirimler', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', body: JSON.stringify({ all: true }),
            });
            if (!response.ok) throw new Error();
            setItems((current) => current.map((notification) => ({ ...notification, read_at: notification.read_at ?? new Date().toISOString() })));
            setUnreadCount(0);
        } catch {
            setError('Bildirimler işaretlenemedi');
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <Button type="button" variant="ghost" size="icon" aria-label={`Bildirimler${unreadCount ? `, ${unreadCount} okunmamış` : ''}`}
                aria-expanded={open} onClick={() => { setOpen((current) => !current); if (!open) void refresh(); }}>
                <Bell className="size-4" />
            </Button>
            {unreadCount > 0 && <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            {open && (
                <div role="region" aria-label="Bildirim kutusu" className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <div><h2 className="text-sm font-semibold">Bildirimler</h2><p className="text-[11px] text-muted-foreground">{unreadCount} okunmamış</p></div>
                        {unreadCount > 0 && <Button type="button" variant="ghost" size="sm" onClick={() => void markAllRead()}><CheckCheck className="size-3.5" /> Tümünü okundu işaretle</Button>}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {loading && !items.length ? <div className="space-y-3 p-4"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div>
                            : error && !items.length ? <p className="p-5 text-center text-xs text-destructive">{error}</p>
                            : !items.length ? <p className="p-6 text-center text-xs text-muted-foreground">Henüz bildirimin yok.</p>
                            : items.map((item) => (
                                <button key={item.id} type="button" onClick={() => void markRead(item.id)}
                                    className={`flex w-full gap-3 border-b border-border/70 px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/70 ${!item.read_at ? 'bg-primary/[0.055]' : ''}`}>
                                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.read_at ? 'bg-transparent' : 'bg-primary'}`} />
                                    <span className="min-w-0"><span className="block text-xs font-medium leading-5">{item.message}</span>
                                        <span className="mt-1 block text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}</span></span>
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
