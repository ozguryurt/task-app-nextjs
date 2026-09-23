import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useTeamStore } from '@/lib/store/team-store';

export function useTeams() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const setTeams = useTeamStore((state) => state.setTeams);

    const fetchTeams = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/takimlar', {
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
            toast.error(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [setTeams]);

    return {
        fetchTeams,
        isLoading,
        error,
    };
}
