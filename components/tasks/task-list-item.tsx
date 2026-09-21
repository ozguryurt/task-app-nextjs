'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/store/team-store';
import { Edit, Trash2, Calendar, User, Clock } from 'lucide-react';

interface TaskListItemProps {
    task: Task;
    isAdmin: boolean;
    currentUserId: number;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number, taskTitle: string) => void;
    isUpdating?: boolean;
}

export function TaskListItem({
    task,
    isAdmin,
    currentUserId,
    onEdit,
    onDelete,
    isUpdating = false,
}: TaskListItemProps) {
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

    const isAssignedToCurrentUser = task.assigned_to === currentUserId;
    const isTaskCreator = task.assigned_by === currentUserId;

    // Düzenleme yetkisi: Admin, görevi atayan kişi veya göreve atanan kişi
    const canEdit = isAdmin || isTaskCreator || isAssignedToCurrentUser;

    // Silme yetkisi: Admin veya görevi atayan kişi
    const canDelete = isAdmin || isTaskCreator;

    return (
        <div className="motion-row rounded-lg border border-border/55 bg-muted/35 p-3.5 hover:border-primary/15 hover:bg-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        <Link
                            href={`/panel/takimlar/${task.team_id}/gorevler/${task.id}`}
                            className="truncate text-sm font-semibold underline-offset-4 hover:text-primary hover:underline"
                        >
                            {task.title}
                        </Link>
                        <Badge className={statusInfo.className}>
                            {statusInfo.label}
                        </Badge>
                        <Badge className={priorityInfo.className}>
                            {priorityInfo.label}
                        </Badge>
                        {task.project_name && <Badge variant="outline" style={{ borderColor: task.project_color || undefined }}>{task.project_name}</Badge>}
                        {task.labels?.map((label) => <Badge key={label.id} variant="outline" style={{ borderColor: label.color, color: label.color }}>{label.name}</Badge>)}
                    </div>

                    {task.description && (
                        <p className="mb-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {task.description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>
                                <span className="font-medium">Atanan:</span> {task.assigned_to_name}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>
                                <span className="font-medium">Atayan:</span> {task.assigned_by_name}
                            </span>
                        </div>

                        {task.due_date && (
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    <span className="font-medium">Bitiş:</span> {formatDate(task.due_date)}
                                </span>
                            </div>
                        )}

                        {task.start_date && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                    <span className="font-medium">Başlangıç:</span> {formatDate(task.start_date)}
                                </span>
                            </div>
                        )}

                        {task.completed_at && (
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    <span className="font-medium">Tamamlanma:</span> {formatDate(task.completed_at)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mt-2 text-[11px] text-muted-foreground/70">
                        Oluşturulma: {new Date(task.created_at).toLocaleString('tr-TR')}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {canEdit && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onEdit(task)}
                            disabled={isUpdating}
                            aria-label={`${task.title} görevini düzenle`}
                            className="text-muted-foreground hover:text-primary"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                    )}

                    {canDelete && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDelete(task.id, task.title)}
                            disabled={isUpdating}
                            aria-label={`${task.title} görevini sil`}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

