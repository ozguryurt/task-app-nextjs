'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Layers3, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resendVerificationEmail, verifyEmail } from '@/lib/api/auth-api';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState(searchParams.get('email') ?? '');
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email || !/^\d{6}$/.test(code)) {
            toast.error('E-posta adresinizi ve 6 haneli kodu kontrol edin.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await verifyEmail({ email, code });
            if (!response.success) {
                toast.error(response.message || 'Kod doğrulanamadı');
                return;
            }

            setIsVerified(true);
            toast.success('E-posta adresiniz doğrulandı');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.error('Önce e-posta adresinizi girin.');
            return;
        }

        setIsResending(true);
        try {
            const response = await resendVerificationEmail({ email });
            if (!response.success) {
                toast.error(response.message || 'Kod gönderilemedi');
                return;
            }

            setCode('');
            toast.success('Yeni doğrulama kodu gönderildi', {
                description: 'Kod 5 dakika geçerlidir.',
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="auth-shell">
            <Card className="auth-card w-full max-w-sm">
                <CardHeader className="text-center">
                    <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-md bg-secondary text-primary">
                        {isVerified ? <CheckCircle2 className="size-5" /> : <MailCheck className="size-5" />}
                    </span>
                    <CardTitle className="text-lg">E-posta doğrulama</CardTitle>
                    <CardDescription>
                        {isVerified
                            ? 'Hesabınız doğrulandı. Artık giriş yapabilirsiniz.'
                            : 'E-posta adresinize gönderilen 6 haneli kodu 5 dakika içinde girin.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isVerified ? (
                        <Button className="w-full" onClick={() => router.replace('/giris')}>Giriş yap</Button>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="code">Doğrulama kodu</Label>
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
                            <Button type="submit" className="w-full" disabled={isSubmitting || code.length !== 6}>
                                {isSubmitting ? 'Doğrulanıyor...' : 'E-postayı doğrula'}
                            </Button>
                            <Button type="button" variant="ghost" className="w-full" onClick={handleResend} disabled={isResending}>
                                {isResending ? 'Gönderiliyor...' : 'Yeni kod gönder'}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="justify-center border-t pt-4 text-xs text-muted-foreground">
                    <Link href="/" className="flex items-center gap-1.5 hover:text-primary"><Layers3 className="size-3.5" /> Taskflow ana sayfa</Link>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="auth-shell"><p className="text-sm text-muted-foreground">Yükleniyor...</p></div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
