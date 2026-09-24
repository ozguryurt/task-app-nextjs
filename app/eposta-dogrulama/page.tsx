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
import { AuthPageShell } from '@/components/layout/auth-page-shell';
import { Skeleton } from '@/components/ui/skeleton';

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
        <AuthPageShell>
            <Card className="auth-card w-full max-w-sm overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_20px_60px_rgba(24,32,66,0.09)]">
                <CardHeader className="border-b border-slate-100 px-5 py-5 text-left sm:px-6">
                    <span className={`mb-3 flex size-10 items-center justify-center rounded-xl ${isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {isVerified ? <CheckCircle2 className="size-5" /> : <MailCheck className="size-5" />}
                    </span>
                    <CardTitle className="text-xl tracking-[-0.035em] text-slate-900">E-posta doğrulama</CardTitle>
                    <CardDescription className="text-xs leading-5">
                        {isVerified
                            ? 'Hesabınız doğrulandı. Artık giriş yapabilirsiniz.'
                            : 'E-posta adresinize gönderilen 6 haneli kodu 5 dakika içinde girin.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-5 py-5 sm:px-6 sm:py-6">
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
                <CardFooter className="justify-center border-t border-slate-100 bg-slate-50/70 py-3.5 text-xs text-muted-foreground">
                    <Link href="/" className="flex items-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-700"><Layers3 className="size-3.5" /> Taskflow ana sayfa</Link>
                </CardFooter>
            </Card>
        </AuthPageShell>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<AuthPageShell><div aria-busy="true" className="w-full max-w-sm space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(24,32,66,0.09)]"><Skeleton className="size-10 rounded-xl" /><Skeleton className="h-6 w-44" /><Skeleton className="h-4 w-full" /><Skeleton className="h-10 w-full rounded-lg" /><Skeleton className="h-10 w-full rounded-lg" /></div></AuthPageShell>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
