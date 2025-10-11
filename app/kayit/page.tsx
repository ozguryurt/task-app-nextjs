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
import Link from "next/link"

export default function Kayit() {
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
                    <form>
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Kullanıcı Adı</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="johndoe"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="fullname">Ad Soyad</Label>
                                <Input
                                    id="fullname"
                                    type="text"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="johndoe@site.com"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Şifre</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="En az 8 karakter"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password-confirm">Şifre Tekrar</Label>
                                <Input
                                    id="password-confirm"
                                    type="password"
                                    placeholder="Şifrenizi tekrar girin"
                                    required
                                />
                            </div>

                            <div className="flex items-start space-x-2 pt-2">
                                <Checkbox id="terms" required />
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
                                    kabul ediyorum.
                                </label>
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="submit" className="w-full">
                        Hesap Oluştur
                    </Button>
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
