'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, GripVertical, Pencil, Trash2, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Task } from '@/lib/store/team-store';
import { cn } from '@/lib/utils';

const columns: Array<{
    status: Task['status'];
    label: string;
    dotClass: string;
    surfaceClass: string;
}> = [
    { status: 'pending', label: 'Beklemede', dotClass: 'bg-amber-500', surfaceClass: 'bg-amber-50/55' },
    { status: 'in_progress', label: 'Devam Ediyor', dotClass: 'bg-indigo-500', surfaceClass: 'bg-indigo-50/55' },
    { status: 'completed', label: 'Tamamlandı', dotClass: 'bg-emerald-500', surfaceClass: 'bg-emerald-50/55' },
    { status: 'cancelled', label: 'İptal', dotClass: 'bg-slate-400', surfaceClass: 'bg-slate-50/70' },
];

const priorityLabels: Record<Task['priority'], string> = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek',
};

const priorityClasses: Record<Task['priority'], string> = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-amber-50 text-amber-800',
    high: 'bg-rose-50 text-rose-800',
};

function canEditTask(task: Task, isAdmin: boolean, currentUserId: number) {
    return isAdmin || task.assigned_by === currentUserId || task.assigned_to === currentUserId;
}

function canDeleteTask(task: Task, isAdmin: boolean, currentUserId: number) {
    return isAdmin || task.assigned_by === currentUserId;
}

export function TaskKanbanBoard({
    tasks,
    isAdmin,
    currentUserId,
    isUpdating,
    onStatusChange,
    onEdit,
    onDelete,
}: {
    tasks: Task[];
    isAdmin: boolean;
    currentUserId: number;
    isUpdating: boolean;
    onStatusChange: (task: Task, status: Task['status']) => Promise<boolean>;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number, taskTitle: string) => void;
}) {
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
    const [overStatus, setOverStatus] = useState<Task['status'] | null>(null);

    const handleDrop = async (status: Task['status']) => {
        const task = tasks.find((item) => item.id === draggedTaskId);
        setDraggedTaskId(null);
        setOverStatus(null);
        if (!task || task.status === status || !canEditTask(task, isAdmin, currentUserId)) return;
        await onStatusChange(task, status);
    };

    return (
        <div className="grid items-start gap-3 xl:grid-cols-4 md:grid-cols-2">
            {columns.map((column) => {
                const columnTasks = tasks.filter((task) => task.status === column.status);
                return (
                    <section
                        key={column.status}
                        onDragOver={(event) => {
                            if (draggedTaskId !== null) {
                                event.preventDefault();
                                setOverStatus(column.status);
                            }
                        }}
                        onDragLeave={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOverStatus(null);
                        }}
                        onDrop={(event) => {
                            event.preventDefault();
                            void handleDrop(column.status);
                        }}
                        className={cn(
                            'min-h-44 rounded-xl border p-2.5 transition-[border-color,background-color,box-shadow] duration-200',
                            column.surfaceClass,
                            overStatus === column.status && 'border-primary/45 bg-primary/5 shadow-[inset_0_0_0_1px_rgba(75,91,180,0.12)]'
                        )}
                    >
                        <div className="mb-2.5 flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <span className={cn('size-2 rounded-full', column.dotClass)} />
                                <h3 className="text-xs font-semibold">{column.label}</h3>
                            </div>
                            <Badge variant="secondary" className="h-5 min-w-5 rounded-full px-1.5 text-[10px]">{columnTasks.length}</Badge>
                        </div>

                        <div className="motion-stagger space-y-2">
                            {columnTasks.length === 0 ? (
                                <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed bg-card/40 px-3 text-center text-[11px] text-muted-foreground">
                                    Buraya görev sürükleyin
                                </div>
                            ) : columnTasks.map((task) => {
                                const editable = canEditTask(task, isAdmin, currentUserId);
                                const deletable = canDeleteTask(task, isAdmin, currentUserId);
                                return (
                                    <article
                                        key={task.id}
                                        draggable={editable && !isUpdating}
                                        onDragStart={(event) => {
                                            setDraggedTaskId(task.id);
                                            event.dataTransfer.effectAllowed = 'move';
                                            event.dataTransfer.setData('text/plain', String(task.id));
                                        }}
                                        onDragEnd={() => {
                                            setDraggedTaskId(null);
                                            setOverStatus(null);
                                        }}
                                        className={cn(
                                            'group rounded-lg border bg-card p-3 shadow-[0_1px_2px_rgba(20,27,50,0.04)] transition-[border-color,box-shadow,transform,opacity] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md',
                                            draggedTaskId === task.id && 'opacity-45'
                                        )}
                                    >
                                        <div className="flex items-start gap-2">
                                            {editable && <GripVertical className="mt-0.5 hidden size-3.5 shrink-0 cursor-grab text-muted-foreground/50 active:cursor-grabbing md:block" />}
                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    href={`/panel/takimlar/${task.team_id}/gorevler/${task.id}`}
                                                    className="line-clamp-2 text-xs font-semibold leading-5 underline-offset-4 hover:text-primary hover:underline"
                                                >
                                                    {task.title}
                                                </Link>
                                                {task.description && <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">{task.description}</p>}
                                            </div>
                                        </div>

                                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                            <Badge className={cn('border-0 text-[10px]', priorityClasses[task.priority])}>{priorityLabels[task.priority]}</Badge>
                                            {task.due_date && (
                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <CalendarDays className="size-3" /> {new Date(task.due_date).toLocaleDateString('tr-TR')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2.5 flex items-center justify-between border-t pt-2">
                                            <span className="flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground">
                                                <UserRound className="size-3 shrink-0" /><span className="truncate">{task.assigned_to_name}</span>
                                            </span>
                                            <div className="flex items-center gap-0.5">
                                                {editable && <Button type="button" variant="ghost" size="icon-sm" className="size-7" onClick={() => onEdit(task)} aria-label={`${task.title} görevini düzenle`}><Pencil className="size-3.5" /></Button>}
                                                {deletable && <Button type="button" variant="ghost" size="icon-sm" className="size-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(task.id, task.title)} aria-label={`${task.title} görevini sil`}><Trash2 className="size-3.5" /></Button>}
                                            </div>
                                        </div>

                                        {editable && (
                                            <Select value={task.status} onValueChange={(value) => void onStatusChange(task, value as Task['status'])} disabled={isUpdating}>
                                                <SelectTrigger aria-label={`${task.title} durumunu değiştir`} className="mt-2 h-7 w-full text-[11px] md:hidden"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {columns.map((item) => <SelectItem key={item.status} value={item.status}>{item.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
