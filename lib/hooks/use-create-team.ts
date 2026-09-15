import { useState } from 'react';
import { toast } from 'sonner';
import { useTeamStore } from '@/lib/store/team-store';

interface CreateTeamData {
    name: string;
    description?: string;
}

export function useCreateTeam() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addTeam } = useTeamStore();

    const createTeam = async (data: CreateTeamData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/takimlar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Takım oluşturulamadı');
            }

            addTeam(result.team);
            toast.success('Takım oluşturuldu', { description: `"${result.team.name}" takımı hazır.` });
            return result.team;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        createTeam,
        isSubmitting,
        error,
    };
}

