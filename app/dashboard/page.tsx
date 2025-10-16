'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogout } from '@/lib/hooks/use-logout';

export default function DashboardPage() {

    const { handleLogout, isSubmitting } = useLogout();

    const { user } = useAuthStore();

    const handleLogoutBtn = async () => {
        await handleLogout();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-gray-600 mt-1">Hoş geldiniz, {user?.name}!</p>
                    </div>
                    <Button onClick={handleLogoutBtn} variant="outline" disabled={isSubmitting}>
                        {isSubmitting ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
                    </Button>
                </div>

                {/* Content */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Kullanıcı Bilgileri */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profil Bilgileri</CardTitle>
                            <CardDescription>Hesap detaylarınız</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-sm text-gray-500">Ad Soyad</p>
                                <p className="font-medium">{user?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">E-posta</p>
                                <p className="font-medium">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">E-posta Doğrulama</p>
                                <p className={`font-medium ${user?.emailVerified ? 'text-green-600' : 'text-orange-600'}`}>
                                    {user?.emailVerified ? '✓ Doğrulanmış' : '⚠ Doğrulanmamış'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Kayıt Tarihi</p>
                                <p className="font-medium">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

