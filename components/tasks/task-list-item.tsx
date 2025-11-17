'use client';

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

    const isAssignedToCurrentUser = task.assigned_to === currentUserId;
    const isTaskCreator = task.assigned_by === currentUserId;

    // Düzenleme yetkisi: Admin, görevi atayan kişi veya göreve atanan kişi
    const canEdit = isAdmin || isTaskCreator || isAssignedToCurrentUser;

    // Silme yetkisi: Admin veya görevi atayan kişi
    const canDelete = isAdmin || isTaskCreator;

    return (
        <div className="py-4 bg-gray-50 hover:bg-gray-100 p-5 rounded-xl transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                            {task.title}
                        </h3>
                        <Badge className={statusInfo.className}>
                            {statusInfo.label}
                        </Badge>
                        <Badge className={priorityInfo.className}>
                            {priorityInfo.label}
                        </Badge>
                    </div>

                    {task.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {task.description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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

                    <div className="mt-2 text-xs text-gray-400">
                        Oluşturulma: {new Date(task.created_at).toLocaleString('tr-TR')}
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                    {canEdit && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(task)}
                            disabled={isUpdating}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                    )}

                    {canDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(task.id, task.title)}
                            disabled={isUpdating}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

