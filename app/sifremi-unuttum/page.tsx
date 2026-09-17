'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Layers3 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPassword, resetPassword } from '@/lib/api/auth-api';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth-schema';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'reset'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const requestCode = async () => {
        if (!email) {
            toast.error('E-posta adresi gereklidir');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await forgotPassword({ email });
            if (!response.success) {
                toast.error(response.message || 'Kod gönderilemedi');
                return;
            }

            setStep('reset');
            setCode('');
            toast.success('Şifre sıfırlama kodu gönderildi', {
                description: '6 haneli kod 5 dakika geçerlidir.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await requestCode();
    };

    const handleResetSubmit = async (data: ResetPasswordFormData) => {
        if (!/^\d{6}$/.test(code)) {
            toast.error('6 haneli kodu girin');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await resetPassword({ email, code, newPassword: data.password });
            if (!response.success) {
                toast.error(response.message || 'Şifre güncellenemedi');
                return;
            }

            toast.success('Şifreniz güncellendi');
            router.replace('/giris');
        } finally {
            setIsSubmitting(false);
        }
    };

    const changeEmail = () => {
        setStep('email');
        setCode('');
        reset();
    };

    return (
        <div className="auth-shell">
            <Card className="auth-card w-full max-w-sm">
                <CardHeader className="text-center">
                    <Link href="/" className="mx-auto mb-3 flex size-9 items-center justify-center rounded-md bg-primary text-white"><Layers3 className="size-4" /></Link>
                    <CardTitle className="text-lg">Şifrenizi yenileyin</CardTitle>
                    <CardDescription>
                        {step === 'email'
                            ? 'E-posta adresinize 5 dakika geçerli bir kod gönderelim.'
                            : `${email} adresine gönderilen 6 haneli kodu ve yeni şifrenizi girin.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="ornek@sirket.com"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Gönderiliyor...' : <><KeyRound /> Kod gönder</>}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit(handleResetSubmit)} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="code">6 haneli kod</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    pattern="[0-9]{6}"
                                    maxLength={6}
                                    value={code}
                                    onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="text-center text-lg tracking-[0.35em]"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Yeni şifre</Label>
                                <Input id="password" type="password" autoComplete="new-password" {...register('password')} disabled={isSubmitting} />
                                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Yeni şifre tekrarı</Label>
                                <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} disabled={isSubmitting} />
                                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting || code.length !== 6}>
                                {isSubmitting ? 'Güncelleniyor...' : 'Şifreyi güncelle'}
                            </Button>
                            <div className="grid grid-cols-2 gap-2">
                                <Button type="button" variant="ghost" size="sm" onClick={changeEmail} disabled={isSubmitting}>E-postayı değiştir</Button>
                                <Button type="button" variant="ghost" size="sm" onClick={requestCode} disabled={isSubmitting}>Yeni kod gönder</Button>
                            </div>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="border-t pt-4">
                    <Button variant="link" className="w-full" asChild><Link href="/giris">Giriş sayfasına dön</Link></Button>
                </CardFooter>
            </Card>
        </div>
    );
}
