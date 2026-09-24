import type { ReactNode } from 'react';

export function WorkspacePageHeader({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow: string;
    title: ReactNode;
    description: string;
    action?: ReactNode;
}) {
    return (
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-500">{eyebrow}</p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.045em] text-slate-900 sm:text-[1.75rem]">{title}</h1>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">{description}</p>
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </header>
    );
}
