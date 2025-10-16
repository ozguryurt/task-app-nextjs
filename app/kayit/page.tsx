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

function Kayit() {
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
        <div className="flex items-center justify-center min-h-screen py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Hesap Oluştur</CardTitle>
                    <CardDescription>
                        Yeni bir hesap oluşturmak için aşağıdaki bilgileri doldurun.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                    placeholder="John Doe"
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
                                    placeholder="johndoe@site.com"
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
                <CardFooter className="flex-col gap-2">
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
export default Kayit;
