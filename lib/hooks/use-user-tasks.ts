import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { TaskLabel } from '@/lib/store/team-store';

export interface UserTask {
    id: number;
    team_id: number;
    team_name: string;
    project_id: number | null;
    project_name: string | null;
    project_color: string | null;
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
    labels: TaskLabel[];
}

export function useUserTasks() {
    const [tasks, setTasks] = useState<UserTask[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const latestRequest = useRef(0);

    const fetchUserTasks = useCallback(async () => {
        const requestId = ++latestRequest.current;
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/kullanici/gorevler', {
                credentials: 'include',
                cache: 'no-store',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Görevler yüklenemedi');
            }

            if (requestId === latestRequest.current) setTasks(data.tasks);
        } catch (err) {
            if (requestId !== latestRequest.current) return;
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            if (requestId === latestRequest.current) setIsLoading(false);
        }
    }, []);

    return {
        tasks,
        fetchUserTasks,
        isLoading,
        error,
    };
}
