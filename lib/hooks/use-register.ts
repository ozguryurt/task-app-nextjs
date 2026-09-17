import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api/auth-api';
import { RegisterFormData } from '@/lib/validations/auth-schema';

export function useRegister() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async (data: RegisterFormData) => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const apiData = {
                email: data.email,
                password: data.password,
                name: data.name,
            };

            const response = await registerUser(apiData);

            if (response.success) {
                setSuccess(response.message);
                toast.success('Hesabınız oluşturuldu', {
                    description: '6 haneli doğrulama kodu e-posta adresinize gönderildi.',
                });
                setTimeout(() => {
                    router.push(`/eposta-dogrulama?email=${encodeURIComponent(data.email)}`);
                }, 800);
                return { success: true, message: response.message };
            } else {
                const errorMessage = response.message || 'Kayıt başarısız';
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
        handleRegister,
        error,
        success,
        isSubmitting,
        clearError: () => setError(null),
        clearSuccess: () => setSuccess(null),
    };
}
