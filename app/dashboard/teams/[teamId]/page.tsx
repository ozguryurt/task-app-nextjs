'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTeamStore, Task } from '@/lib/store/team-store';
import { useTeamMembers } from '@/lib/hooks/use-team-members';
import { useTasks } from '@/lib/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddMemberDialog } from '@/components/teams/add-member-dialog';
import { MemberListItem } from '@/components/teams/member-list-item';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';
import { TaskListItem } from '@/components/tasks/task-list-item';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ArrowLeft, Users, UserPlus, Trash2, Calendar, ClipboardList, Plus, Loader2, Layers3 } from 'lucide-react';
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
    const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
    const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
    const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<{ id: number; title: string } | null>(null);
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

    const {
        tasks,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        isLoading: isLoadingTasks,
        isSubmitting: isSubmittingTask,
        error: tasksError,
    } = useTasks(teamId);

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

            // Üyeleri ve görevleri çek
            await Promise.all([
                fetchMembers(),
                fetchTasks(),
            ]);
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

    // Task handlers
    const handleCreateTask = async (data: any) => {
        await createTask(data);
        if (!tasksError) {
            setIsCreateTaskDialogOpen(false);
        }
    };

    const handleEditTaskClick = (task: Task) => {
        setTaskToEdit(task);
        setIsEditTaskDialogOpen(true);
    };

    const handleUpdateTask = async (data: any) => {
        if (!taskToEdit) return;
        const success = await updateTask(taskToEdit.id, data);
        if (success) {
            setIsEditTaskDialogOpen(false);
            setTaskToEdit(null);
        }
    };

    const handleDeleteTaskClick = (taskId: number, taskTitle: string) => {
        setTaskToDelete({ id: taskId, title: taskTitle });
        setIsDeleteTaskDialogOpen(true);
    };

    const handleConfirmDeleteTask = async () => {
        if (!taskToDelete) return;

        try {
            await deleteTask(taskToDelete.id);
            setIsDeleteTaskDialogOpen(false);
            setTaskToDelete(null);
        } catch (err) {
            // Hata hook tarafında işleniyor
        }
    };

    if (isLoadingTeam) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="size-6 animate-spin text-primary" />
                    <p>Takım hazırlanıyor...</p>
                </div>
            </div>
        );
    }

    if (teamError) {
        return (
            <div className="min-h-screen py-8">
                <div className="container mx-auto max-w-6xl px-5">
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
        <main className="min-h-screen pb-12">
            <header className="border-b border-black/[0.04] bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
                    <div className="flex items-center gap-2.5"><span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20"><Layers3 className="size-4.5" /></span><span className="text-sm font-bold tracking-tight">Taskflow</span></div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}><ArrowLeft /> Dashboard</Button>
                </div>
            </header>
            <div className="container mx-auto max-w-6xl px-5 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard')}
                        className="mb-3 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Geri
                    </Button>

                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold tracking-[-0.035em]">{currentTeam.name}</h1>
                            {currentTeam.description && (
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{currentTeam.description}</p>
                            )}
                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
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
                <Card className="mt-6">
                    <CardHeader className="border-b">
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
                            <p className="py-8 text-center text-sm text-muted-foreground">Üyeler yükleniyor...</p>
                        ) : currentTeamMembers.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="mx-auto mb-3 size-10 text-muted-foreground/45" />
                                <p className="text-sm text-muted-foreground">Henüz üye yok</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
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

                {/* Tasks Section */}
                <Card className="mt-5">
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Görevler</CardTitle>
                                <CardDescription>
                                    {isAdmin
                                        ? 'Takım görevlerini görüntüleyin ve yönetin'
                                        : 'Takım görevlerini görüntüleyin'}
                                </CardDescription>
                            </div>
                            {isAdmin && (
                                <Button onClick={() => setIsCreateTaskDialogOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Görev Oluştur
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {tasksError && (
                            <Alert variant="destructive" className="mb-4">
                                {tasksError}
                            </Alert>
                        )}

                        {isLoadingTasks ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Görevler yükleniyor...</p>
                        ) : tasks.length === 0 ? (
                            <div className="text-center py-8">
                                <ClipboardList className="mx-auto mb-3 size-10 text-muted-foreground/45" />
                                <p className="text-sm text-muted-foreground">Henüz görev yok</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tasks.map((task) => (
                                    <TaskListItem
                                        key={task.id}
                                        task={task}
                                        isAdmin={isAdmin}
                                        currentUserId={user?.id || 0}
                                        onEdit={handleEditTaskClick}
                                        onDelete={handleDeleteTaskClick}
                                        isUpdating={isSubmittingTask}
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

                {/* Create Task Dialog */}
                <CreateTaskDialog
                    open={isCreateTaskDialogOpen}
                    onOpenChange={setIsCreateTaskDialogOpen}
                    onSubmit={handleCreateTask}
                    members={currentTeamMembers}
                    isSubmitting={isSubmittingTask}
                    error={tasksError}
                />

                {/* Edit Task Dialog */}
                <EditTaskDialog
                    open={isEditTaskDialogOpen}
                    onOpenChange={setIsEditTaskDialogOpen}
                    onSubmit={handleUpdateTask}
                    task={taskToEdit}
                    members={currentTeamMembers}
                    isSubmitting={isSubmittingTask}
                    error={tasksError}
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

                {/* Delete Task Confirmation Dialog */}
                <ConfirmDialog
                    open={isDeleteTaskDialogOpen}
                    onOpenChange={setIsDeleteTaskDialogOpen}
                    onConfirm={handleConfirmDeleteTask}
                    title="Görevi Sil"
                    description={taskToDelete ? `"${taskToDelete.title}" görevini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.` : ''}
                    confirmText="Evet, Sil"
                    cancelText="İptal"
                    isDestructive={true}
                    isLoading={isSubmittingTask}
                />
            </div>
        </main>
    );
}

