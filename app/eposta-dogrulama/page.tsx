'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, MailCheck, MailWarning } from 'lucide-react';

type VerificationStatus = 'idle' | 'loading' | 'success' | 'error';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<VerificationStatus>(token ? 'loading' : 'idle');
    const [resendEmail, setResendEmail] = useState('');
    const [isResending, setIsResending] = useState(false);

    const verifyEmail = async (verificationToken: string) => {
        try {
            setStatus('loading');
            const response = await fetch(`/api/kimlik/eposta-dogrulama?token=${verificationToken}`, {
                cache: 'no-store',
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'E-posta doğrulanamadı');
            }

            setStatus('success');
            toast.success('E-posta adresiniz doğrulandı', {
                description: data.message || 'Artık hesabınıza giriş yapabilirsiniz.',
            });
        } catch (error) {
            setStatus('error');
            const errorMessage = error instanceof Error ? error.message : 'Doğrulama sırasında bir hata oluştu';
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        if (!token) {
            setStatus('idle');
            toast.error('Geçersiz doğrulama bağlantısı', {
                description: 'E-postanızı kontrol edin veya yeni bir doğrulama e-postası talep edin.',
            });
            return;
        }

        verifyEmail(token);
    }, [token]);

    const handleResend = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!resendEmail) {
            toast.error('E-posta adresi gerekli', { description: 'Lütfen e-posta adresinizi girin.' });
            return;
        }

        try {
            setIsResending(true);
            const response = await fetch('/api/kimlik/eposta-dogrulama', {
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

            toast.success('Doğrulama e-postası gönderildi', {
                description: data.message || 'E-posta adresinizi kontrol edin.',
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Doğrulama e-postası gönderilirken bir hata oluştu';
            toast.error(errorMessage);
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

        return <MailWarning className="w-12 h-12 text-muted-foreground/50" />;
    };

    return (
        <div className="subtle-grid min-h-screen flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-xl border-white/90 bg-white/85 shadow-[0_24px_80px_rgba(46,40,100,0.13)]">
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
                    {status === 'loading' && (
                        <p className="text-center text-sm text-muted-foreground">Doğrulama işlemi devam ediyor...</p>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col gap-3">
                            <Button onClick={() => router.push('/giris')}>Giriş Yap</Button>
                            <Button variant="outline" onClick={() => router.push('/panel')}>
                                Panele Dön
                            </Button>
                        </div>
                    )}

                    {status !== 'success' && (
                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 text-sm text-muted-foreground">Doğrulama e-postasını bulamadınız mı?</p>
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
                            </div>

                            <div className="space-y-1 text-center text-sm text-muted-foreground">
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

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={(
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
            )}
        >
            <VerifyEmailContent />
        </Suspense>
    );
}

