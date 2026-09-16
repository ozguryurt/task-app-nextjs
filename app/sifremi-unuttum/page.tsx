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
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/validations/auth-schema"
import { forgotPassword } from "@/lib/api/auth-api"
import { toast } from "sonner"
import { useState } from "react"
import { KeyRound, Layers3 } from "lucide-react"

export default function ForgotPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsSubmitting(true);

        try {
            const response = await forgotPassword(data);

            if (response.success) {
                toast.success('Sıfırlama bağlantısı gönderildi', {
                    description: 'Kayıtlı e-posta adresinizi kontrol edin.',
                });
            } else {
                toast.error(response.message || 'Bir hata oluştu');
            }
        } catch (err) {
            toast.error('Beklenmeyen bir hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-shell">
            <Card className="auth-card w-full max-w-sm">
                <CardHeader className="text-center">
                    <Link href="/" className="mx-auto mb-3 flex size-9 items-center justify-center rounded-md bg-primary text-white"><Layers3 className="size-4" /></Link>
                    <CardTitle className="text-lg">Erişiminizi geri alın</CardTitle>
                    <CardDescription>
                        E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Gönderiliyor..." : <><KeyRound /> Bağlantı gönder</>}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2 border-t pt-4">
                    <Button variant="link" className="w-full" asChild>
                        <Link href="/giris">
                            Giriş sayfasına dön
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
