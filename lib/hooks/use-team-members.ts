import { useState } from 'react';
import { toast } from 'sonner';
import { useTeamStore } from '@/lib/store/team-store';

interface AddMemberData {
    email: string;
    role: 'admin' | 'member';
}

export function useTeamMembers(teamId: number) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setCurrentTeamMembers, addMember, updateMember, removeMember } = useTeamStore();

    const fetchMembers = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/takimlar/${teamId}/uyeler`, {
                method: 'GET',
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Üyeler yüklenemedi');
            }

            setCurrentTeamMembers(data.members || []);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const addTeamMember = async (data: AddMemberData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/takimlar/${teamId}/uyeler`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Üye eklenemedi');
            }

            addMember(result.member);
            toast.success('Üye eklendi', { description: `${result.member?.name ?? data.email} takıma eklendi.` });
            return result.member;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateTeamMemberRole = async (memberId: number, role: 'admin' | 'member') => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/takimlar/${teamId}/uyeler/${memberId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ role }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Üye rolü güncellenemedi');
            }

            updateMember(memberId, { role });
            toast.success('Üye rolü güncellendi', {
                description: role === 'admin' ? 'Üye artık takım yöneticisi.' : 'Üye artık takım üyesi.',
            });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeTeamMember = async (memberId: number) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/takimlar/${teamId}/uyeler/${memberId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Üye çıkarılamadı');
            }

            removeMember(memberId);
            toast.success('Üye takımdan çıkarıldı');
            return true;
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
        fetchMembers,
        addTeamMember,
        updateTeamMemberRole,
        removeTeamMember,
        isLoading,
        isSubmitting,
        error,
    };
}

