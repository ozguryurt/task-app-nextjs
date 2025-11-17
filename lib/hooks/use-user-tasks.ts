import { useState, useCallback } from 'react';

export interface UserTask {
    id: number;
    team_id: number;
    team_name: string;
    assigned_to: number;
    assigned_by: number;
    assigned_by_name: string;
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
}

export function useUserTasks() {
    const [tasks, setTasks] = useState<UserTask[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/user/tasks', {
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Görevler yüklenemedi');
            }

            setTasks(data.tasks);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        tasks,
        fetchUserTasks,
        isLoading,
        error,
    };
}

