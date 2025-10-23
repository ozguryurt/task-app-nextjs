'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTeamStore } from '@/lib/store/team-store';
import { useTeams } from '@/lib/hooks/use-teams';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogout } from '@/lib/hooks/use-logout';
import { CreateTeamDialog } from '@/components/teams/create-team-dialog';
import { TeamCard } from '@/components/teams/team-card';
import { Plus, Users } from 'lucide-react';

export default function DashboardPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const { handleLogout, isSubmitting } = useLogout();
    const { user } = useAuthStore();
    const { teams } = useTeamStore();
    const { fetchTeams, isLoading } = useTeams();

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleLogoutBtn = async () => {
        await handleLogout();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
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
                <div className="grid gap-6 lg:grid-cols-3">
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

                {/* Takımlar Bölümü */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Users className="w-6 h-6" />
                            <h2 className="text-2xl font-bold">Takımlarım</h2>
                        </div>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Yeni Takım
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Takımlar yükleniyor...</p>
                        </div>
                    ) : teams.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Henüz takımınız yok</h3>
                                    <p className="text-gray-500 mb-4">
                                        Yeni bir takım oluşturarak başlayın ve ekip arkadaşlarınızı davet edin.
                                    </p>
                                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        İlk Takımı Oluştur
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {teams.map((team) => (
                                <TeamCard key={team.id} team={team} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Team Dialog */}
                <CreateTeamDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    onSuccess={() => fetchTeams()}
                />
            </div>
        </div>
    );
}

