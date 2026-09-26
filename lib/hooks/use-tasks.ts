import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTeamStore } from '../store/team-store';
import type { TaskLabel } from '../store/team-store';
import { notifyTasksChanged } from '@/lib/task-events';

export interface Task {
    id: number;
    team_id: number;
    project_id: number | null;
    project_name: string | null;
    project_color: string | null;
    assigned_to: number;
    assigned_by: number;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    start_date: string | null;
    end_date: string | null;
    due_date: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    assigned_to_name: string;
    assigned_to_email: string;
    assigned_by_name: string;
    assigned_by_email: string;
    labels: TaskLabel[];
}

export interface CreateTaskData {
    project_id?: number | null;
    label_ids?: number[];
    assigned_to: number;
    title: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high';
    start_date?: string | null;
    end_date?: string | null;
    due_date?: string | null;
}

export interface UpdateTaskData {
    project_id?: number | null;
    label_ids?: number[];
    assigned_to?: number;
    title?: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high';
    start_date?: string | null;
    end_date?: string | null;
    due_date?: string | null;
}

export function useTasks(teamId: number) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { currentTeamTasks, setCurrentTeamTasks } = useTeamStore();

    // Görevleri getir
    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/takimlar/${teamId}/gorevler`, {
                credentials: 'include',
                cache: 'no-store',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Görevler yüklenemedi');
            }

            setCurrentTeamTasks(data.tasks);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [teamId, setCurrentTeamTasks]);

    // Yeni görev oluştur
    const createTask = useCallback(
        async (taskData: CreateTaskData) => {
            setIsSubmitting(true);
            setError(null);

            try {
                const response = await fetch(`/api/takimlar/${teamId}/gorevler`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(taskData),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Görev oluşturulamadı');
                }

                // Yeni görevi listeye ekle
                setCurrentTeamTasks([data.task, ...currentTeamTasks]);
                notifyTasksChanged();

                toast.success('Görev oluşturuldu', { description: taskData.title });
                return true;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
                setError(errorMessage);
                toast.error(errorMessage);
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [teamId, currentTeamTasks, setCurrentTeamTasks]
    );

    // Görevi güncelle
    const updateTask = useCallback(
        async (taskId: number, taskData: UpdateTaskData) => {
            setIsSubmitting(true);
            setError(null);

            try {
                const response = await fetch(`/api/takimlar/${teamId}/gorevler/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(taskData),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Görev güncellenemedi');
                }

                // Görev listesini güncelle
                setCurrentTeamTasks(
                    currentTeamTasks.map((task) =>
                        task.id === taskId ? data.task : task
                    )
                );
                notifyTasksChanged();

                toast.success('Görev güncellendi', {
                    description: taskData.title ?? currentTeamTasks.find((task) => task.id === taskId)?.title,
                });
                return true;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
                setError(errorMessage);
                toast.error(errorMessage);
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [teamId, currentTeamTasks, setCurrentTeamTasks]
    );

    // Görevi sil
    const deleteTask = useCallback(
        async (taskId: number) => {
            setIsSubmitting(true);
            setError(null);

            try {
                const response = await fetch(`/api/takimlar/${teamId}/gorevler/${taskId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Görev silinemedi');
                }

                // Görevi listeden çıkar
                setCurrentTeamTasks(
                    currentTeamTasks.filter((task) => task.id !== taskId)
                );
                notifyTasksChanged();

                toast.success('Görev silindi', {
                    description: currentTeamTasks.find((task) => task.id === taskId)?.title,
                });
                return true;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
                setError(errorMessage);
                toast.error(errorMessage);
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [teamId, currentTeamTasks, setCurrentTeamTasks]
    );

    return {
        tasks: currentTeamTasks,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        isLoading,
        isSubmitting,
        error,
    };
}
