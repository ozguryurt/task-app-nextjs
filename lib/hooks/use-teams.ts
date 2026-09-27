import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTeamStore } from '@/lib/store/team-store';
import { readApiJson } from '@/lib/api/read-api-json';

export function useTeams() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const latestRequest = useRef(0);
    const setTeams = useTeamStore((state) => state.setTeams);

    const fetchTeams = useCallback(async () => {
        const requestId = ++latestRequest.current;
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/takimlar', {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store',
            });

            const data = await readApiJson(response);

            if (!response.ok) {
                throw new Error(data.error || 'Takımlar yüklenemedi');
            }

            if (requestId === latestRequest.current) setTeams(data.teams || []);
            return data.teams;
        } catch (err) {
            if (requestId !== latestRequest.current) throw err;
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            setTeams([]);
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            if (requestId === latestRequest.current) setIsLoading(false);
        }
    }, [setTeams]);

    return {
        fetchTeams,
        isLoading,
        error,
    };
}
