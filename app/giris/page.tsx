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
import { Layers3 } from "lucide-react"

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
        <div className="auth-shell">
            <Card className="auth-card w-full max-w-sm">
                <CardHeader className="text-center">
                    <Link href="/" className="mx-auto mb-3 flex size-9 items-center justify-center rounded-md bg-primary text-white"><Layers3 className="size-4" /></Link>
                    <CardTitle className="text-lg">Tekrar hoş geldiniz</CardTitle>
                    <CardDescription>
                        Çalışma alanınıza devam etmek için giriş yapın.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                <CardFooter className="flex-col gap-2 border-t pt-4">
                    <Button variant="link" className="w-full" asChild>
                        <Link href="/kayit">
                            Hesabınız yok mu? Ücretsiz kayıt olun.
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

// Middleware otomatik olarak auth kontrolü yapıyor
export default LoginPage;
