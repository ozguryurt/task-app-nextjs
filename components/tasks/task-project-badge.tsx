import { FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TaskProjectBadge({
    projectName,
    color,
    className,
}: {
    projectName: string | null | undefined;
    color?: string | null;
    className?: string;
}) {
    return (
        <span className={cn('inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600', className)} title={`Proje: ${projectName || '(Proje yok)'}`}>
            <FolderKanban className="size-3 shrink-0" style={color ? { color } : undefined} />
            <span className="shrink-0 text-slate-400">Proje:</span>
            <span className="truncate">{projectName || '(Proje yok)'}</span>
        </span>
    );
}
