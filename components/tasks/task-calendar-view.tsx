'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarX2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Task } from '@/lib/store/team-store';
import { createMonthGrid, taskDateKey } from '@/lib/task-calendar';
import { cn } from '@/lib/utils';

const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const statusClasses: Record<Task['status'], string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-900',
    in_progress: 'border-indigo-200 bg-indigo-50 text-indigo-900',
    completed: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    cancelled: 'border-slate-200 bg-slate-100 text-slate-600',
};

export function TaskCalendarView({
    tasks,
}: {
    tasks: Task[];
}) {
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    const days = useMemo(() => createMonthGrid(month), [month]);
    const tasksByDate = useMemo(() => {
        const grouped = new Map<string, Task[]>();
        for (const task of tasks) {
            const key = taskDateKey(task.due_date);
            if (!key) continue;
            grouped.set(key, [...(grouped.get(key) ?? []), task]);
        }
        return grouped;
    }, [tasks]);
    const undatedTasks = useMemo(() => tasks.filter((task) => !taskDateKey(task.due_date)), [tasks]);

    const changeMonth = (offset: number) => {
        setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
    };

    const goToToday = () => {
        const now = new Date();
        setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h3 className="text-sm font-semibold capitalize">{month.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Görevler teslim tarihlerine göre gösterilir.</p>
                </div>
                <div className="flex items-center gap-1">
                    <Button type="button" size="sm" variant="outline" className="h-8 px-2.5 text-xs" onClick={goToToday}>Bugün</Button>
                    <Button type="button" size="icon-sm" variant="outline" onClick={() => changeMonth(-1)} aria-label="Önceki ay"><ChevronLeft /></Button>
                    <Button type="button" size="icon-sm" variant="outline" onClick={() => changeMonth(1)} aria-label="Sonraki ay"><ChevronRight /></Button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border bg-card">
                <div className="min-w-[680px]">
                    <div className="grid grid-cols-7 border-b bg-muted/45">
                        {weekDays.map((day) => <div key={day} className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7">
                        {days.map((day, index) => {
                        const dayTasks = tasksByDate.get(day.key) ?? [];
                        return (
                            <div
                                key={day.key}
                                className={cn(
                                    'min-h-24 border-b border-r p-1.5 transition-colors last:border-r-0 sm:min-h-32 sm:p-2',
                                    (index + 1) % 7 === 0 && 'border-r-0',
                                    index >= 35 && 'border-b-0',
                                    !day.isCurrentMonth && 'bg-muted/20 text-muted-foreground/55',
                                    day.isToday && 'bg-primary/[0.035]'
                                )}
                            >
                                <div className="mb-1 flex items-center justify-between">
                                    <span className={cn(
                                        'flex size-6 items-center justify-center rounded-full text-[11px] font-medium',
                                        day.isToday && 'bg-primary text-primary-foreground'
                                    )}>{day.date.getDate()}</span>
                                    {dayTasks.length > 0 && <span className="text-[9px] text-muted-foreground sm:hidden">{dayTasks.length}</span>}
                                </div>
                                <div className="space-y-1">
                                    {dayTasks.slice(0, 3).map((task) => (
                                            <Link
                                                key={task.id}
                                                href={`/panel/takimlar/${task.team_id}/gorevler/${task.id}`}
                                                title={`${task.title} · ${task.assigned_to_name}`}
                                                className={cn(
                                                    'block w-full truncate rounded border px-1.5 py-1 text-left text-[9px] font-medium transition-[filter,transform] sm:text-[10px]',
                                                    statusClasses[task.status],
                                                    'hover:-translate-y-px hover:brightness-[0.98]'
                                                )}
                                            >
                                                {task.title}
                                            </Link>
                                    ))}
                                    {dayTasks.length > 3 && <p className="px-1 text-[9px] font-medium text-muted-foreground">+{dayTasks.length - 3} görev</p>}
                                </div>
                            </div>
                        );
                        })}
                    </div>
                </div>
            </div>

            {undatedTasks.length > 0 && (
                <div className="rounded-xl border bg-muted/25 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2"><CalendarX2 className="size-4 text-muted-foreground" /><h3 className="text-xs font-semibold">Teslim tarihi olmayanlar</h3></div>
                        <Badge variant="secondary">{undatedTasks.length}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {undatedTasks.map((task) => (
                                <Link
                                    key={task.id}
                                    href={`/panel/takimlar/${task.team_id}/gorevler/${task.id}`}
                                    className="rounded-md border bg-card px-2.5 py-1.5 text-[11px] font-medium transition-[border-color,box-shadow,transform] hover:-translate-y-px hover:border-primary/30 hover:shadow-sm"
                                >
                                    {task.title}
                                </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
