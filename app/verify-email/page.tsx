'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Loader2, MailCheck, MailWarning } from 'lucide-react';

type VerificationStatus = 'idle' | 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<VerificationStatus>(token ? 'loading' : 'idle');
    const [message, setMessage] = useState<string | null>(null);
    const [resendEmail, setResendEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const verifyEmail = async (verificationToken: string) => {
        try {
            setStatus('loading');
            const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`, {
                cache: 'no-store',
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'E-posta doğrulanamadı');
            }

            setStatus('success');
            setMessage(data.message || 'E-posta adresiniz başarıyla doğrulandı!');
        } catch (error) {
            setStatus('error');
            const errorMessage = error instanceof Error ? error.message : 'Doğrulama sırasında bir hata oluştu';
            setMessage(errorMessage);
        }
    };

    useEffect(() => {
        if (!token) {
            setStatus('idle');
            setMessage('Geçersiz e-posta doğrulama kodu. Lütfen e-postanızı kontrol edin veya yeni bir doğrulama e-postası talep edin.');
            return;
        }

        verifyEmail(token);
    }, [token]);

    const handleResend = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setResendMessage(null);
        setResendStatus('idle');

        if (!resendEmail) {
            setResendStatus('error');
            setResendMessage('Lütfen e-posta adresinizi girin.');
            return;
        }

        try {
            setIsResending(true);
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: resendEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Doğrulama e-postası gönderilemedi');
            }

            setResendStatus('success');
            setResendMessage(data.message || 'Yeni doğrulama e-postası gönderildi.');
        } catch (error) {
            setResendStatus('error');
            const errorMessage =
                error instanceof Error ? error.message : 'Doğrulama e-postası gönderilirken bir hata oluştu';
            setResendMessage(errorMessage);
        } finally {
            setIsResending(false);
        }
    };

    const renderIcon = () => {
        if (status === 'loading') {
            return <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />;
        }

        if (status === 'success') {
            return <MailCheck className="w-12 h-12 text-green-500" />;
        }

        if (status === 'error') {
            return <MailWarning className="w-12 h-12 text-amber-500" />;
        }

        return <MailWarning className="w-12 h-12 text-gray-400" />;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-xl">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center mb-4">{renderIcon()}</div>
                    <CardTitle className="text-2xl">E-posta Doğrulama</CardTitle>
                    <CardDescription>
                        {status === 'success'
                            ? 'Hesabınız başarıyla doğrulandı. Hemen giriş yapabilirsiniz.'
                            : 'Hesabınızı aktive etmek için e-posta adresinizi doğrulayın.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {message && (
                        <Alert variant={status === 'success' ? 'default' : 'destructive'}>
                            {message}
                        </Alert>
                    )}

                    {status === 'loading' && (
                        <p className="text-sm text-gray-500 text-center">Doğrulama işlemi devam ediyor...</p>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col gap-3">
                            <Button onClick={() => router.push('/giris')}>Giriş Yap</Button>
                            <Button variant="outline" onClick={() => router.push('/dashboard')}>
                                Dashboard&apos;a Dön
                            </Button>
                        </div>
                    )}

                    {status !== 'success' && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Doğrulama e-postasını bulamadınız mı?</p>
                                <form onSubmit={handleResend} className="space-y-3">
                                    <div className="space-y-2">
                                        <Input
                                            type="email"
                                            placeholder="E-posta adresiniz"
                                            value={resendEmail}
                                            onChange={(e) => setResendEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" disabled={isResending} className="w-full">
                                        {isResending ? 'Gönderiliyor...' : 'Yeni Doğrulama E-postası Gönder'}
                                    </Button>
                                </form>
                                {resendMessage && (
                                    <Alert
                                        variant={resendStatus === 'error' ? 'destructive' : 'default'}
                                        className="mt-3"
                                    >
                                        {resendMessage}
                                    </Alert>
                                )}
                            </div>

                            <div className="text-center text-sm text-gray-500 space-y-1">
                                <p>E-posta adresinizi yanlış yazdıysanız yeni bir hesap oluşturabilirsiniz.</p>
                                <div className="flex justify-center gap-2">
                                    <Link href="/giris" className="text-blue-600 hover:underline">
                                        Giriş Yap
                                    </Link>
                                    <span>·</span>
                                    <Link href="/kayit" className="text-blue-600 hover:underline">
                                        Yeni Hesap Oluştur
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

