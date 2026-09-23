'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AtSign, BadgeCheck, KeyRound, LoaderCircle, MailCheck, ShieldCheck, UserRound } from 'lucide-react';
import { useAuthStore, type User } from '@/lib/store/auth-store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileResponse {
    success: boolean;
    message: string;
    data?: { user?: User };
}

async function profileRequest(body?: Record<string, string>): Promise<ProfileResponse> {
    const response = await fetch('/api/kullanici/profil', {
        method: body ? 'POST' : 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json() as ProfileResponse;
    if (!response.ok || !result.success) throw new Error(result.message || 'İşlem tamamlanamadı');
    return result;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, setUser } = useAuthStore();
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
    const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailCode, setEmailCode] = useState('');
    const [emailCodeSent, setEmailCodeSent] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    useEffect(() => {
        let active = true;
        void profileRequest().then((result) => {
            if (active && result.data?.user) setUser(result.data.user);
        }).catch((loadError: unknown) => {
            if (active) {
                setError(loadError instanceof Error ? loadError.message : 'Profil yüklenemedi');
                if (loadError instanceof Error && loadError.message.includes('Oturum')) router.replace('/giris');
            }
        }).finally(() => {
            if (active) setIsLoadingProfile(false);
        });
        return () => { active = false; };
    }, [router, setUser]);

    const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setNotice('');
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('Yeni şifreler eşleşmiyor.');
            return;
        }
        setIsPasswordSubmitting(true);
        try {
            const result = await profileRequest({ action: 'change-password', ...passwordForm });
            if (result.data?.user) setUser(result.data.user);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setNotice(result.message);
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Şifre güncellenemedi');
        } finally {
            setIsPasswordSubmitting(false);
        }
    };

    const handleEmailChange = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setNotice('');
        setIsEmailSubmitting(true);
        try {
            if (!emailCodeSent) {
                const result = await profileRequest({
                    action: 'request-email-change',
                    currentPassword: emailCurrentPassword,
                    newEmail,
                });
                setEmailCodeSent(true);
                setEmailCode('');
                setNotice(result.message);
            } else {
                const result = await profileRequest({
                    action: 'verify-email-change',
                    currentPassword: emailCurrentPassword,
                    code: emailCode,
                });
                if (result.data?.user) setUser(result.data.user);
                setEmailCodeSent(false);
                setEmailCode('');
                setEmailCurrentPassword('');
                setNewEmail('');
                setNotice(result.message);
            }
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'E-posta adresi güncellenemedi');
        } finally {
            setIsEmailSubmitting(false);
        }
    };

    const cancelEmailChange = () => {
        setEmailCodeSent(false);
        setEmailCode('');
        setEmailCurrentPassword('');
        setNewEmail('');
        setError('');
        setNotice('');
    };

    return (
        <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-6 flex items-center gap-3">
                <Button variant="outline" size="icon" className="size-9 rounded-xl border-slate-200 bg-white" onClick={() => router.push('/panel')} aria-label="Panele dön"><ArrowLeft className="size-4" /></Button>
                <div><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-500">Hesap ayarları</p><h1 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-slate-900">Profilim</h1></div>
            </div>

            {(error || notice) && <Alert variant={error ? 'destructive' : 'success'} className="mb-5"><AlertDescription>{error || notice}</AlertDescription></Alert>}

            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                    <CardHeader className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <span className="mb-1 flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><UserRound className="size-5" /></span>
                        <CardTitle className="text-base">Hesap bilgileri</CardTitle>
                        <CardDescription className="text-xs">Profilin ve doğrulama durumun.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 py-5 sm:px-6">
                        {isLoadingProfile ? <div className="flex items-center gap-2 py-2 text-xs text-slate-500"><LoaderCircle className="size-4 animate-spin" /> Profil yükleniyor...</div> : <>
                            <ProfileValue icon={UserRound} label="Ad soyad" value={user?.name || '—'} />
                            <ProfileValue icon={AtSign} label="E-posta adresi" value={user?.email || '—'} />
                            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3">
                                <div className="flex items-center gap-2.5"><ShieldCheck className="size-4 text-slate-400" /><span className="text-xs text-slate-600">E-posta doğrulaması</span></div>
                                <Badge className={user?.emailVerified ? 'border-0 bg-emerald-50 text-emerald-700' : 'border-0 bg-amber-50 text-amber-700'}>{user?.emailVerified ? 'Doğrulandı' : 'Bekliyor'}</Badge>
                            </div>
                        </>}
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                        <CardHeader className="border-b border-slate-100 px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><KeyRound className="size-4" /></span><div><CardTitle className="text-sm">Şifreyi değiştir</CardTitle><CardDescription className="mt-1 text-[10px]">İşlem için mevcut şifren doğrulanır.</CardDescription></div></div></CardHeader>
                        <CardContent className="py-5 sm:px-6">
                            <form className="space-y-3.5" onSubmit={handlePasswordChange}>
                                <FormField label="Mevcut şifre" id="current-password"><Input id="current-password" type="password" autoComplete="current-password" required value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} /></FormField>
                                <div className="grid gap-3 sm:grid-cols-2"><FormField label="Yeni şifre" id="new-password"><Input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} /></FormField><FormField label="Yeni şifre (tekrar)" id="confirm-password"><Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} /></FormField></div>
                                <p className="text-[10px] leading-5 text-slate-400">En az 8 karakter; büyük harf, küçük harf ve rakam içermeli.</p>
                                <Button type="submit" size="sm" className="rounded-lg" disabled={isPasswordSubmitting}>{isPasswordSubmitting && <LoaderCircle className="animate-spin" />} Şifreyi güncelle</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                        <CardHeader className="border-b border-slate-100 px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><MailCheck className="size-4" /></span><div><CardTitle className="text-sm">E-posta adresini değiştir</CardTitle><CardDescription className="mt-1 text-[10px]">Yeni adrese gönderilen 6 haneli kodla doğrula.</CardDescription></div></div></CardHeader>
                        <CardContent className="py-5 sm:px-6">
                            <form className="space-y-3.5" onSubmit={handleEmailChange}>
                                {!emailCodeSent ? <FormField label="Yeni e-posta adresi" id="new-email"><Input id="new-email" type="email" autoComplete="email" maxLength={254} required value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="ornek@eposta.com" /></FormField> : <>
                                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-3.5 py-3"><p className="text-[10px] text-indigo-700">Doğrulama kodu gönderildi</p><p className="mt-0.5 break-all text-xs font-semibold text-slate-800">{newEmail}</p><p className="mt-1 text-[10px] text-slate-500">Kod 5 dakika geçerlidir.</p></div>
                                    <FormField label="6 haneli kod" id="email-code"><Input id="email-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={emailCode} onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="max-w-48 text-center font-mono text-lg tracking-[0.3em]" /></FormField>
                                </>}
                                <FormField label="Mevcut şifre" id="email-current-password"><Input id="email-current-password" type="password" autoComplete="current-password" required value={emailCurrentPassword} onChange={(event) => setEmailCurrentPassword(event.target.value)} /></FormField>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button type="submit" size="sm" className="rounded-lg" disabled={isEmailSubmitting || (emailCodeSent && emailCode.length !== 6)}>{isEmailSubmitting ? <LoaderCircle className="animate-spin" /> : emailCodeSent ? <BadgeCheck /> : <MailCheck />}{emailCodeSent ? 'Kodu doğrula ve güncelle' : 'Doğrulama kodu gönder'}</Button>
                                    {emailCodeSent && <Button type="button" size="sm" variant="ghost" className="rounded-lg text-slate-500" onClick={cancelEmailChange}>İptal</Button>}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ProfileValue({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
    return <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3"><Icon className="size-4 shrink-0 text-slate-400" /><div className="min-w-0"><p className="text-[10px] text-slate-400">{label}</p><p className="mt-0.5 truncate text-xs font-medium text-slate-800">{value}</p></div></div>;
}

function FormField({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
    return <div className="space-y-1.5"><Label htmlFor={id} className="text-[11px] text-slate-600">{label}</Label>{children}</div>;
}
