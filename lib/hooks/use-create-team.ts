import { useState } from 'react';
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
            const response = await fetch('/api/teams', {
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
            return result.team;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            setError(errorMessage);
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

