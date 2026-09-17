import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { logoutUser } from '@/lib/api/auth-api';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTeamStore } from '@/lib/store/team-store';
import { AUTH_CONFIG } from '@/lib/middleware/auth-config';

export function useLogout() {
    const { logout } = useAuthStore();
    const resetTeams = useTeamStore((state) => state.reset);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isLoggingOut = useRef(false);

    const handleLogout = async () => {
        if (isLoggingOut.current) {
            return { success: false, message: 'Çıkış işlemi devam ediyor' };
        }

        isLoggingOut.current = true;
        setIsSubmitting(true);
        setError(null);
        let logoutCompleted = false;

        try {
            const response = await logoutUser();
            if (response.success) {
                logout();
                resetTeams();
                logoutCompleted = true;
                toast.success('Çıkış yapıldı', { description: 'Güvenli biçimde çıkış yaptınız.' });

                // Tam sayfa geçişi, App Router önbelleğini geride bırakır ve proxy'nin
                // silinen oturum çerezini yeni bir sunucu isteğinde doğrulamasını sağlar.
                window.location.replace(AUTH_CONFIG.redirects.afterLogout);
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
            // Başarılı çıkışta sayfa tamamen değişene kadar butonu kilitli tut.
            if (!logoutCompleted) {
                isLoggingOut.current = false;
                setIsSubmitting(false);
            }
        }
    };

    return {
        handleLogout,
        error,
        isSubmitting,
        clearError: () => setError(null),
    };
}
