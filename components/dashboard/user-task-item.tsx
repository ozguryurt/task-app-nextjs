'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { UserTask } from '@/lib/hooks/use-user-tasks';
import { Calendar, User, ArrowUpRight } from 'lucide-react';

interface UserTaskItemProps {
    task: UserTask;
}

export function UserTaskItem({ task }: UserTaskItemProps) {
    const router = useRouter();

    const getStatusBadge = (status: string) => {
        const statusMap = {
            pending: { label: 'Beklemede', className: 'bg-amber-50 text-amber-800' },
            in_progress: { label: 'Devam Ediyor', className: 'bg-indigo-50 text-indigo-800' },
            completed: { label: 'Tamamlandı', className: 'bg-emerald-50 text-emerald-800' },
            cancelled: { label: 'İptal Edildi', className: 'bg-slate-100 text-slate-600' },
        };
        return statusMap[status as keyof typeof statusMap] || statusMap.pending;
    };

    const getPriorityBadge = (priority: string) => {
        const priorityMap = {
            low: { label: 'Düşük', className: 'bg-slate-100 text-slate-600' },
            medium: { label: 'Orta', className: 'bg-amber-50 text-amber-800' },
            high: { label: 'Yüksek', className: 'bg-rose-50 text-rose-800' },
        };
        return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
    };

    const statusInfo = getStatusBadge(task.status);
    const priorityInfo = getPriorityBadge(task.priority);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    const handleClick = () => {
        router.push(`/panel/takimlar/${task.team_id}/gorevler/${task.id}`);
    };

    return (
        <button
            type="button"
            className="motion-row group w-full rounded-lg border border-border/55 bg-muted/35 p-3.5 text-left hover:border-primary/15 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 active:translate-y-0"
            onClick={handleClick}
        >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-semibold">
                                {task.title}
                            </h3>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{task.team_name}</p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>

                {task.description && (
                    <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                        {task.description}
                    </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge className={`${statusInfo.className} border-0`}>
                        {statusInfo.label}
                    </Badge>
                    <Badge className={`${priorityInfo.className} border-0`}>
                        {priorityInfo.label}
                    </Badge>
                    {task.project_name && <Badge variant="outline" style={{ borderColor: task.project_color || undefined }}>{task.project_name}</Badge>}
                    {task.labels?.map((label) => <Badge key={label.id} variant="outline" style={{ borderColor: label.color, color: label.color }}>{label.name}</Badge>)}
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2.5 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Atayan: {task.assigned_by_name}</span>
                    </div>

                    {task.due_date && (
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Bitiş: {formatDate(task.due_date)}</span>
                        </div>
                    )}
                </div>
        </button>
    );
}

