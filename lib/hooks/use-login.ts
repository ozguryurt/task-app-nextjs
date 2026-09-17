import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api/auth-api';
import { useAuthStore, User } from '@/lib/store/auth-store';
import { LoginFormData } from '@/lib/validations/auth-schema';
import { AUTH_CONFIG } from '@/lib/middleware/auth-config';

export function useLogin() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (data: LoginFormData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await loginUser(data);
            if (response.success && response.data) {
                const userData = response.data as { user: User };
                login(userData.user);
                toast.success('Giriş başarılı', { description: 'Panele yönlendiriliyorsunuz.' });
                router.push(AUTH_CONFIG.redirects.afterLogin);
                return { success: true, message: response.message };
            } else {
                if ('requiresVerification' in response && response.requiresVerification === true) {
                    toast.info('E-posta doğrulaması gerekli', {
                        description: 'E-postanıza gönderilen 6 haneli kodu girin.',
                    });
                    router.push(`/eposta-dogrulama?email=${encodeURIComponent(data.email)}`);
                    return { success: false, message: response.message };
                }

                const errorMessage = response.message || 'Giriş başarısız';
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
        handleLogin,
        error,
        isSubmitting,
        clearError: () => setError(null),
    };
}
