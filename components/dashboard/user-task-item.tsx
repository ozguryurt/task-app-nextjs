'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UserTask } from '@/lib/hooks/use-user-tasks';
import { Calendar, User, ArrowRight } from 'lucide-react';

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
        <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                                {task.title}
                            </h3>
                            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Takım:</span> {task.team_name}
                        </p>
                    </div>
                </div>

                {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={statusInfo.className}>
                        {statusInfo.label}
                    </Badge>
                    <Badge className={priorityInfo.className}>
                        {priorityInfo.label}
                    </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
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
            </CardContent>
        </Card>
    );
}

