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
            pending: { label: 'Beklemede', className: 'bg-yellow-100 text-yellow-800' },
            in_progress: { label: 'Devam Ediyor', className: 'bg-blue-100 text-blue-800' },
            completed: { label: 'Tamamlandı', className: 'bg-green-100 text-green-800' },
            cancelled: { label: 'İptal Edildi', className: 'bg-red-100 text-red-800' },
        };
        return statusMap[status as keyof typeof statusMap] || statusMap.pending;
    };

    const getPriorityBadge = (priority: string) => {
        const priorityMap = {
            low: { label: 'Düşük', className: 'bg-gray-100 text-gray-800' },
            medium: { label: 'Orta', className: 'bg-orange-100 text-orange-800' },
            high: { label: 'Yüksek', className: 'bg-red-100 text-red-800' },
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
        router.push(`/dashboard/teams/${task.team_id}`);
    };

    return (
        <button
            type="button"
            className="group w-full rounded-xl border border-transparent bg-muted/55 p-3 text-left transition-all hover:border-primary/10 hover:bg-white hover:shadow-sm"
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

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge className={`${statusInfo.className} border-0`}>
                        {statusInfo.label}
                    </Badge>
                    <Badge className={`${priorityInfo.className} border-0`}>
                        {priorityInfo.label}
                    </Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 border-t pt-2.5 text-[11px] text-muted-foreground">
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

