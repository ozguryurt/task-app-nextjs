import { useState } from 'react';
import { useTeamStore } from '@/lib/store/team-store';

export function useTeams() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setTeams } = useTeamStore();

    const fetchTeams = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/teams', {
                method: 'GET',
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Takımlar yüklenemedi');
            }

            setTeams(data.teams || []);
            return data.teams;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        fetchTeams,
        isLoading,
        error,
    };
}

