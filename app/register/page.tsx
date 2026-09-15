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
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, RegisterFormData } from "@/lib/validations/auth-schema"
import { useRegister } from "@/lib/hooks/use-register"
import { Layers3 } from "lucide-react"

function RegisterPage() {
    const { handleRegister, error, success, isSubmitting } = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            terms: false,
        },
    });

    const termsValue = watch("terms");

    const onSubmit = async (data: RegisterFormData) => {
        await handleRegister(data);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
            <div className="subtle-grid absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
            <div className="absolute left-1/2 top-1/3 -z-10 size-[30rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[110px]" />
            <Card className="w-full max-w-md border-white/90 bg-white/85 shadow-[0_24px_80px_rgba(46,40,100,0.13)]">
                <CardHeader className="text-center">
                    <Link href="/" className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20"><Layers3 className="size-5" /></Link>
                    <CardTitle className="text-xl">Çalışma alanınızı oluşturun</CardTitle>
                    <CardDescription>
                        Ekibinizle daha düzenli çalışmaya birkaç adım uzaktasınız.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Hata mesajı */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Başarı mesajı */}
                        {success && (
                            <Alert variant="success">
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

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

                            {/* Kullanım Şartları */}
                            <div className="flex items-start space-x-2 pt-2">
                                <Checkbox
                                    id="terms"
                                    checked={termsValue}
                                    onCheckedChange={(checked) =>
                                        setValue("terms", checked as boolean, {
                                            shouldValidate: true,
                                        })
                                    }
                                    disabled={isSubmitting}
                                />
                                <label
                                    htmlFor="terms"
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    <Link href="/sozlesme" className="text-primary hover:underline">
                                        Kullanıcı sözleşmesini
                                    </Link>{" "}
                                    ve{" "}
                                    <Link href="/gizlilik" className="text-primary hover:underline">
                                        gizlilik politikasını
                                    </Link>{" "}
                                    kabul ediyorum. <span className="text-red-500">*</span>
                                </label>
                            </div>
                            {errors.terms && (
                                <p className="text-sm text-red-500">{errors.terms.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2 border-t pt-4">
                    <Button variant="link" className="w-full" asChild>
                        <Link href="/login">
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
