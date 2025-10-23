'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTeamStore } from '@/lib/store/team-store';
import { useTeamMembers } from '@/lib/hooks/use-team-members';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddMemberDialog } from '@/components/teams/add-member-dialog';
import { MemberListItem } from '@/components/teams/member-list-item';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ArrowLeft, Users, UserPlus, Trash2, Calendar } from 'lucide-react';
import { Alert } from '@/components/ui/alert';

interface PageProps {
    params: Promise<{ teamId: string }>;
}

export default function TeamDetailPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const teamId = parseInt(resolvedParams.teamId);
    const router = useRouter();
    const { user } = useAuthStore();
    const { currentTeam, currentTeamMembers, setCurrentTeam } = useTeamStore();
    const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
    const [isDeleteTeamDialogOpen, setIsDeleteTeamDialogOpen] = useState(false);
    const [isDeleteMemberDialogOpen, setIsDeleteMemberDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<{ id: number; name: string } | null>(null);
    const [isLoadingTeam, setIsLoadingTeam] = useState(true);
    const [isDeletingTeam, setIsDeletingTeam] = useState(false);
    const [teamError, setTeamError] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);

    const {
        fetchMembers,
        addTeamMember,
        updateTeamMemberRole,
        removeTeamMember,
        isLoading,
        isSubmitting,
        error: membersError,
    } = useTeamMembers(teamId);

    useEffect(() => {
        loadTeamAndMembers();
    }, [teamId]);

    const loadTeamAndMembers = async () => {
        try {
            setIsLoadingTeam(true);
            setTeamError(null);

            // Takım detaylarını çek
            const teamResponse = await fetch(`/api/teams/${teamId}`, {
                credentials: 'include',
            });

            const teamData = await teamResponse.json();

            if (!teamResponse.ok) {
                throw new Error(teamData.error || 'Takım yüklenemedi');
            }

            setCurrentTeam(teamData.team);
            setUserRole(teamData.userRole);

            // Üyeleri çek
            await fetchMembers();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            setTeamError(errorMessage);
        } finally {
            setIsLoadingTeam(false);
        }
    };

    const handleAddMember = async (email: string, role: 'admin' | 'member') => {
        await addTeamMember({ email, role });
    };

    const handleRoleChange = async (memberId: number, role: 'admin' | 'member'): Promise<boolean> => {
        return await updateTeamMemberRole(memberId, role);
    };

    const handleRemoveMemberClick = (memberId: number, memberName: string) => {
        setMemberToDelete({ id: memberId, name: memberName });
        setIsDeleteMemberDialogOpen(true);
    };

    const handleConfirmRemoveMember = async () => {
        if (!memberToDelete) return;

        try {
            await removeTeamMember(memberToDelete.id);
            setIsDeleteMemberDialogOpen(false);
            setMemberToDelete(null);
        } catch (err) {
            // Hata hook tarafında işleniyor
        }
    };

    const handleDeleteTeamClick = () => {
        setIsDeleteTeamDialogOpen(true);
    };

    const handleConfirmDeleteTeam = async () => {
        setIsDeletingTeam(true);

        try {
            const response = await fetch(`/api/teams/${teamId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Takım silinemedi');
            }

            router.push('/dashboard');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            setTeamError(errorMessage);
            setIsDeleteTeamDialogOpen(false);
        } finally {
            setIsDeletingTeam(false);
        }
    };

    if (isLoadingTeam) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <p className="text-center text-gray-500">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (teamError) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <Alert variant="destructive" className="mb-4">
                        {teamError}
                    </Alert>
                    <Button variant="outline" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Dashboard'a Dön
                    </Button>
                </div>
            </div>
        );
    }

    if (!currentTeam) {
        return null;
    }

    const isAdmin = userRole === 'admin';

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Geri
                    </Button>

                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold">{currentTeam.name}</h1>
                            {currentTeam.description && (
                                <p className="text-gray-600 mt-2">{currentTeam.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        Oluşturulma: {new Date(currentTeam.created_at).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{currentTeamMembers.length} üye</span>
                                </div>
                            </div>
                        </div>

                        {isAdmin && (
                            <Button
                                variant="destructive"
                                onClick={handleDeleteTeamClick}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Takımı Sil
                            </Button>
                        )}
                    </div>
                </div>

                {/* Members Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Takım Üyeleri</CardTitle>
                                <CardDescription>
                                    {isAdmin
                                        ? 'Takım üyelerini yönetin'
                                        : 'Takım üyelerini görüntüleyin'}
                                </CardDescription>
                            </div>
                            {isAdmin && (
                                <Button onClick={() => setIsAddMemberDialogOpen(true)}>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Üye Ekle
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {membersError && (
                            <Alert variant="destructive" className="mb-4">
                                {membersError}
                            </Alert>
                        )}

                        {isLoading ? (
                            <p className="text-center text-gray-500 py-8">Üyeler yükleniyor...</p>
                        ) : currentTeamMembers.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">Henüz üye yok</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {currentTeamMembers.map((member) => (
                                    <MemberListItem
                                        key={member.id}
                                        member={member}
                                        isAdmin={isAdmin}
                                        currentUserId={user?.id || 0}
                                        onRoleChange={handleRoleChange}
                                        onRemove={handleRemoveMemberClick}
                                        isUpdating={isSubmitting}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add Member Dialog */}
                <AddMemberDialog
                    open={isAddMemberDialogOpen}
                    onOpenChange={setIsAddMemberDialogOpen}
                    onSubmit={handleAddMember}
                    isSubmitting={isSubmitting}
                    error={membersError}
                />

                {/* Delete Team Confirmation Dialog */}
                <ConfirmDialog
                    open={isDeleteTeamDialogOpen}
                    onOpenChange={setIsDeleteTeamDialogOpen}
                    onConfirm={handleConfirmDeleteTeam}
                    title="Takımı Sil"
                    description={`"${currentTeam?.name}" takımını silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm takım verileri kalıcı olarak silinecektir.`}
                    confirmText="Evet, Sil"
                    cancelText="İptal"
                    isDestructive={true}
                    isLoading={isDeletingTeam}
                />

                {/* Delete Member Confirmation Dialog */}
                <ConfirmDialog
                    open={isDeleteMemberDialogOpen}
                    onOpenChange={setIsDeleteMemberDialogOpen}
                    onConfirm={handleConfirmRemoveMember}
                    title="Üyeyi Çıkar"
                    description={memberToDelete ? `"${memberToDelete.name}" isimli üyeyi takımdan çıkarmak istediğinize emin misiniz?` : ''}
                    confirmText="Evet, Çıkar"
                    cancelText="İptal"
                    isDestructive={true}
                    isLoading={isSubmitting}
                />
            </div>
        </div>
    );
}

