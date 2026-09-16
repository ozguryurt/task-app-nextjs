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
import { Layers3 } from "lucide-react"

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
        <div className="auth-shell">
            <Card className="auth-card w-full max-w-md">
                <CardHeader className="text-center">
                    <Link href="/" className="mx-auto mb-3 flex size-9 items-center justify-center rounded-md bg-primary text-white"><Layers3 className="size-4" /></Link>
                    <CardTitle className="text-lg">Çalışma alanınızı oluşturun</CardTitle>
                    <CardDescription>
                        Ekibinizle daha düzenli çalışmaya birkaç adım uzaktasınız.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex flex-col gap-4">
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
                <CardFooter className="flex-col gap-2 border-t pt-4">
                    <Button variant="link" className="w-full" asChild>
                        <Link href="/giris">
                            Zaten hesabınız var mı? Giriş yapın.
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

// Middleware otomatik olarak auth kontrolü yapıyor
export default RegisterPage;
