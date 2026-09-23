import Link from 'next/link';
import { ArrowLeft, Layers3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkspaceTopbarProps {
    context: string;
    backHref: string;
    backLabel: string;
    userName?: string;
}

export function WorkspaceTopbar({ context, backHref, backLabel, userName }: WorkspaceTopbarProps) {
    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
            <div className="mx-auto flex h-[4.25rem] max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/panel" className="group flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-[0_5px_14px_rgba(55,70,180,0.24)] transition-transform group-hover:-rotate-3"><Layers3 className="size-4" /></span>
                    <span className="text-sm font-semibold tracking-[-0.025em] text-slate-900">Taskflow</span>
                    <span className="hidden h-4 w-px bg-slate-200 sm:block" />
                    <span className="hidden max-w-56 truncate text-[11px] text-slate-500 sm:block">{context}</span>
                </Link>
                <div className="flex items-center gap-2 sm:gap-3">
                    {userName && <span className="hidden max-w-36 truncate text-[11px] font-medium text-slate-500 sm:block">{userName}</span>}
                    {userName && <span className="flex size-7 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-700">{userName.slice(0, 2).toLocaleUpperCase('tr-TR')}</span>}
                    <Button variant="ghost" size="sm" asChild className="h-8 rounded-lg text-slate-500 hover:text-indigo-700"><Link href={backHref}><ArrowLeft className="size-3.5" /><span className="hidden sm:inline">{backLabel}</span><span className="sm:hidden">Geri</span></Link></Button>
                </div>
            </div>
        </header>
    );
}
