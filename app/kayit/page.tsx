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
import { registerSchema, RegisterFormData } from "@/lib/validations/auth-schema"
import { useRegister } from "@/lib/hooks/use-register"
import { UserRoundPlus } from "lucide-react"
import { AuthPageShell } from "@/components/layout/auth-page-shell"

function RegisterPage() {
    const { handleRegister, isSubmitting } = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        await handleRegister(data);
    };

    return (
        <AuthPageShell>
            <Card className="auth-card w-full max-w-md overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_20px_60px_rgba(24,32,66,0.09)]">
                <CardHeader className="border-b border-slate-100 px-5 py-5 text-left sm:px-6">
                    <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><UserRoundPlus className="size-5" /></span>
                    <CardTitle className="text-xl tracking-[-0.035em] text-slate-900">Çalışma alanınızı oluşturun</CardTitle>
                    <CardDescription className="text-xs leading-5">Ekibinizle daha düzenli çalışmaya birkaç adım uzaktasınız.</CardDescription>
                </CardHeader>
                <CardContent className="px-5 py-5 sm:px-6 sm:py-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
                        <div className="flex flex-col gap-3">
                            {/* Ad Soyad */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    Ad Soyad <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Adınız Soyadınız"
                                    {...register("name")}
                                    disabled={isSubmitting}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name.message}</p>
                                )}
                            </div>

                            {/* E-posta */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    E-posta <span className="text-red-500">*</span>
                                </Label>
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
                                <Label htmlFor="password">
                                    Şifre <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="En az 8 karakter"
                                    {...register("password")}
                                    disabled={isSubmitting}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Şifre Tekrar */}
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">
                                    Şifre Tekrar <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Şifrenizi tekrar girin"
                                    {...register("confirmPassword")}
                                    disabled={isSubmitting}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-500">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2 border-t border-slate-100 bg-slate-50/70 py-3.5">
                    <p className="text-xs text-slate-500">Zaten hesabınız var mı? <Link href="/giris" className="font-semibold text-indigo-600 hover:text-indigo-700">Giriş yapın</Link></p>
                </CardFooter>
            </Card>
        </AuthPageShell>
    )
}

// Middleware otomatik olarak auth kontrolü yapıyor
export default RegisterPage;
