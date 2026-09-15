import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/api/auth-api';
import { useAuthStore, User } from '@/lib/store/auth-store';

export function useLogout() {
    const router = useRouter();
    const { logout } = useAuthStore();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogout = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await logoutUser();
            if (response.success) {
                logout();
                toast.success('Çıkış yapıldı', { description: 'Güvenli biçimde çıkış yaptınız.' });
                router.push('/giris');
                return { success: true, message: response.message };
            } else {
                const errorMessage = response.message || 'Çıkış başarısız';
                setError(errorMessage);
                toast.error(errorMessage);
                return { success: false, message: errorMessage };
            }
        } catch (err) {
            const errorMessage = 'Beklenmeyen bir hata oluştu';
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        handleLogout,
        error,
        isSubmitting,
        clearError: () => setError(null),
    };
}

