'use client';

import { useRouter } from 'next/navigation';
import { ArrowUpRight, Calendar, CheckCircle2, Circle, CircleDot } from 'lucide-react';
import { UserTask } from '@/lib/hooks/use-user-tasks';
import { TaskProjectBadge } from '@/components/tasks/task-project-badge';

interface UserTaskItemProps {
    task: UserTask;
}

const priorityStyles = {
    low: { label: 'Düşük', className: 'bg-slate-100 text-slate-500' },
    medium: { label: 'Orta', className: 'bg-amber-50 text-amber-700' },
    high: { label: 'Yüksek', className: 'bg-rose-50 text-rose-600' },
} as const;

export function UserTaskItem({ task }: UserTaskItemProps) {
    const router = useRouter();
    const priority = priorityStyles[task.priority] ?? priorityStyles.medium;
    const isCompleted = task.status === 'completed';
    const isInProgress = task.status === 'in_progress';
    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    return (
        <button
            type="button"
            className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/25 sm:gap-3 sm:px-3"
            onClick={() => router.push(`/panel/takimlar/${task.team_id}/gorevler/${task.id}`)}
        >
            <span className="shrink-0">
                {isCompleted
                    ? <CheckCircle2 className="size-4 text-emerald-500" />
                    : isInProgress
                        ? <CircleDot className="size-4 text-indigo-500" />
                        : <Circle className="size-4 text-slate-300 transition-colors group-hover:text-indigo-400" />}
            </span>
            <span className="min-w-0 flex-1">
                <span className={`block truncate text-[11px] font-medium sm:text-xs ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-indigo-700'}`}>{task.title}</span>
                <span className="mt-1 flex min-w-0 items-center gap-1.5 text-[9px] text-slate-400 sm:text-[10px]">
                    <TaskProjectBadge projectName={task.project_name} color={task.project_color} className="shrink-0 border-0 bg-transparent px-0 py-0 text-[9px] text-slate-500 sm:text-[10px]" />
                    <span className="max-w-28 truncate text-slate-400" title={`Takım: ${task.team_name}`}>{task.team_name}</span>
                    {task.due_date && <><span className="text-slate-300">·</span><Calendar className="size-2.5 shrink-0" /><span>{formatDate(task.due_date)}</span></>}
                    {task.labels?.slice(0, 1).map((label) => <span key={label.id} className="hidden rounded-full px-1.5 py-0.5 sm:inline-flex" style={{ backgroundColor: `${label.color}18`, color: label.color }}>{label.name}</span>)}
                </span>
            </span>
            <span className={`hidden shrink-0 rounded-full px-2 py-1 text-[8px] font-medium sm:inline-flex ${priority.className}`}>{priority.label}</span>
            <span title={`Atayan: ${task.assigned_by_name}`} className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[8px] font-bold text-indigo-700">{task.assigned_by_name.slice(0, 2).toLocaleUpperCase('tr-TR')}</span>
            <ArrowUpRight className="size-3.5 shrink-0 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-500" />
        </button>
    );
}
