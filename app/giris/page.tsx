'use client';

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginFormData } from "@/lib/validations/auth-schema"
import { useLogin } from "@/lib/hooks/use-login"
import { LockKeyhole } from "lucide-react"
import { AuthPageShell } from "@/components/layout/auth-page-shell"

function LoginPage() {
    const { handleLogin, isSubmitting } = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        await handleLogin(data);
    };

    return (
        <AuthPageShell>
            <Card className="auth-card w-full max-w-sm overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_20px_60px_rgba(24,32,66,0.09)]">
                <CardHeader className="border-b border-slate-100 px-5 py-5 text-left sm:px-6">
                    <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><LockKeyhole className="size-5" /></span>
                    <CardTitle className="text-xl tracking-[-0.035em] text-slate-900">Tekrar hoş geldiniz</CardTitle>
                    <CardDescription className="text-xs leading-5">Çalışma alanınıza devam etmek için hesabınıza giriş yapın.</CardDescription>
                </CardHeader>
                <CardContent className="px-5 py-5 sm:px-6 sm:py-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex flex-col gap-4">
                            {/* E-posta */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ornek@sirket.com"
                                    {...register("email")}
                                    disabled={isSubmitting}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Şifre */}
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Şifre</Label>
                                    <Link
                                        href="/sifremi-unuttum"
                                        className="ml-auto inline-block text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                                    >
                                        Şifremi unuttum
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    disabled={isSubmitting}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">{errors.password.message}</p>
                                )}
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2 border-t border-slate-100 bg-slate-50/70 py-3.5">
                    <p className="text-xs text-slate-500">Hesabınız yok mu? <Link href="/kayit" className="font-semibold text-indigo-600 hover:text-indigo-700">Ücretsiz kayıt olun</Link></p>
                </CardFooter>
            </Card>
        </AuthPageShell>
    )
}

// Middleware otomatik olarak auth kontrolü yapıyor
export default LoginPage;
