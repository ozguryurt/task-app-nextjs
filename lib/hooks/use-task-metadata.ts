import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { TaskLabel, TaskProject, TaskTemplate } from '@/lib/store/team-store';
import { notifyTasksChanged } from '@/lib/task-events';

export type MetadataType = 'project' | 'label' | 'template';

export function useTaskMetadata(teamId: number) {
    const [projects, setProjects] = useState<TaskProject[]>([]);
    const [labels, setLabels] = useState<TaskLabel[]>([]);
    const [templates, setTemplates] = useState<TaskTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchMetadata = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/takimlar/${teamId}/gorev-yapilandirma`, { credentials: 'include' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Görev yapılandırması yüklenemedi');
            setProjects(data.projects ?? []);
            setLabels(data.labels ?? []);
            setTemplates(data.templates ?? []);
            return data;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Görev yapılandırması yüklenemedi');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [teamId]);

    const createMetadata = async (payload: Record<string, unknown> & { type: MetadataType }) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/takimlar/${teamId}/gorev-yapilandirma`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Kayıt oluşturulamadı');
            await fetchMetadata();
            toast.success(payload.type === 'project' ? 'Proje oluşturuldu' : payload.type === 'label' ? 'Etiket oluşturuldu' : 'Şablon oluşturuldu');
            return true;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Kayıt oluşturulamadı');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteMetadata = async (type: MetadataType, id: number) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/takimlar/${teamId}/gorev-yapilandirma`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ type, id }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Kayıt silinemedi');
            if (type === 'project') notifyTasksChanged();
            await fetchMetadata();
            toast.success('Kayıt kaldırıldı');
            return true;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Kayıt silinemedi');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { projects, labels, templates, isLoading, isSubmitting, fetchMetadata, createMetadata, deleteMetadata };
}
