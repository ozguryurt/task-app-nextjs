'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { ProjectMilestone } from '@/lib/store/team-store';
import { readApiJson } from '@/lib/api/read-api-json';

type MilestoneData = {
    name: string;
    description?: string;
    target_date?: string | null;
};

export function useProjectMilestones(teamId: number) {
    const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const endpoint = `/api/takimlar/${teamId}/kilometre-taslari`;

    const refreshMilestones = useCallback(async () => {
        const response = await fetch(endpoint, { credentials: 'include', cache: 'no-store' });
        const data = await readApiJson(response);
        if (!response.ok) throw new Error(data.error || 'Kilometre taşları yüklenemedi');
        setMilestones(data.milestones ?? []);
    }, [endpoint]);

    const mutate = async (method: 'POST' | 'PUT' | 'DELETE', body: Record<string, unknown>) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(endpoint, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await readApiJson(response);
            if (!response.ok) throw new Error(data.error || 'Kilometre taşı kaydedilemedi');
            await refreshMilestones();
            toast.success(method === 'DELETE' ? 'Kilometre taşı silindi' : method === 'PUT' ? 'Kilometre taşı güncellendi' : 'Kilometre taşı eklendi');
            return true;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'İşlem tamamlanamadı');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        milestones,
        isSubmitting,
        refreshMilestones,
        createMilestone: (projectId: number, data: MilestoneData) => mutate('POST', { project_id: projectId, ...data }),
        updateMilestone: (id: number, data: MilestoneData) => mutate('PUT', { id, ...data }),
        deleteMilestone: (id: number) => mutate('DELETE', { id }),
    };
}
