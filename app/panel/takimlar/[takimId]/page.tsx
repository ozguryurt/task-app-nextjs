'use client';

import { useEffect, useMemo, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTeamStore, Task } from '@/lib/store/team-store';
import { useTeamMembers } from '@/lib/hooks/use-team-members';
import { useTasks } from '@/lib/hooks/use-tasks';
import { useTaskMetadata } from '@/lib/hooks/use-task-metadata';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddMemberDialog } from '@/components/teams/add-member-dialog';
import { MemberListItem } from '@/components/teams/member-list-item';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';
import { TaskListItem } from '@/components/tasks/task-list-item';
import { TaskFilterBar } from '@/components/tasks/task-filter-bar';
import { TaskKanbanBoard } from '@/components/tasks/task-kanban-board';
import { TaskCalendarView } from '@/components/tasks/task-calendar-view';
import { TaskViewSwitcher, type TaskView } from '@/components/tasks/task-view-switcher';
import { TaskMetadataManager } from '@/components/tasks/task-metadata-manager';
import { defaultTaskFilters, filterTasks, type TaskFilterState } from '@/lib/task-filters';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ArrowLeft, Users, UserPlus, Trash2, Calendar, ClipboardList, Plus, Loader2, Layers3, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

interface PageProps {
    params: Promise<{ takimId: string }>;
}

export default function TeamDetailPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const teamId = parseInt(resolvedParams.takimId);
    const router = useRouter();
    const { user } = useAuthStore();
    const { currentTeam, currentTeamMembers, setCurrentTeam } = useTeamStore();
    const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
    const [isDeleteTeamDialogOpen, setIsDeleteTeamDialogOpen] = useState(false);
    const [isDeleteMemberDialogOpen, setIsDeleteMemberDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<{ id: number; name: string } | null>(null);
    const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
    const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false);
    const [taskFilters, setTaskFilters] = useState<TaskFilterState>({ ...defaultTaskFilters });
    const [taskView, setTaskView] = useState<TaskView>('list');
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
    } = useTeamMembers(teamId);

    const {
        tasks,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        isLoading: isLoadingTasks,
        isSubmitting: isSubmittingTask,
    } = useTasks(teamId);

    const {
        projects, labels, templates, fetchMetadata, createMetadata, deleteMetadata,
        isSubmitting: isSubmittingMetadata,
    } = useTaskMetadata(teamId);

    const visibleTasks = useMemo(
        () => filterTasks(tasks, taskFilters, (task) => `${task.assigned_to_name} ${task.assigned_by_name} ${task.project_name ?? ''} ${task.labels?.map((label) => label.name).join(' ') ?? ''}`),
        [tasks, taskFilters]
    );
    const taskAssignees = useMemo(
        () => Array.from(new Map(tasks.map((task) => [task.assigned_to, {
            id: task.assigned_to,
            name: task.assigned_to_name,
        }])).values()).sort((a, b) => a.name.localeCompare(b.name, 'tr-TR')),
        [tasks]
    );

    useEffect(() => {
        loadTeamAndMembers();
    }, [teamId]);

    const loadTeamAndMembers = async () => {
        try {
            setIsLoadingTeam(true);
            setTeamError(null);

            // Takım detaylarını çek
            const teamResponse = await fetch(`/api/takimlar/${teamId}`, {
                credentials: 'include',
            });

            const teamData = await teamResponse.json();

            if (!teamResponse.ok) {
                throw new Error(teamData.error || 'Takım yüklenemedi');
            }

            setCurrentTeam(teamData.team);
            setUserRole(teamData.userRole);

            // Üyeleri ve görevleri çek (hata bildirimleri ilgili hook içinde gösterilir)
            await Promise.all([
                fetchMembers().catch(() => {}),
                fetchTasks(),
                fetchMetadata().catch(() => {}),
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
            const response = await fetch(`/api/takimlar/${teamId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Takım silinemedi');
            }

            toast.success('Takım silindi', { description: `"${currentTeam?.name}" takımı kaldırıldı.` });
            router.push('/panel');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            toast.error(errorMessage);
            setIsDeleteTeamDialogOpen(false);
        } finally {
            setIsDeletingTeam(false);
        }
    };

    // Task handlers
    const handleCreateTask = async (data: any) => {
        return createTask(data);
    };

    const handleEditTaskClick = (task: Task) => {
        setTaskToEdit(task);
        setIsEditTaskDialogOpen(true);
    };

    const handleUpdateTask = async (data: any) => {
        if (!taskToEdit) return false;
        const success = await updateTask(taskToEdit.id, data);
        if (success) {
            setTaskToEdit(null);
        }
        return success;
    };

    const handleTaskStatusChange = async (task: Task, status: Task['status']) => {
        if (task.status === status) return true;
        return updateTask(task.id, { status });
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
                    <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                        {teamError}
                    </p>
                    <Button variant="outline" onClick={() => router.push('/panel')}>
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
        <main className="app-shell">
            <header className="app-header">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-2.5"><span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_6px_16px_rgba(55,70,180,0.24)]"><Layers3 className="size-4" /></span><div><span className="block text-sm font-semibold tracking-tight">Taskflow</span><span className="block text-[10px] text-muted-foreground">Takım alanı</span></div></div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/panel')}><ArrowLeft /> Dashboard</Button>
                </div>
            </header>
            <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
                {/* Header */}
                <div className="mb-5">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/panel')}
                        className="mb-3 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Geri
                    </Button>

                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                        <div className="flex-1">
                            <p className="section-kicker mb-2">Takım çalışma alanı</p>
                            <h1 className="page-heading">{currentTeam.name}</h1>
                            {currentTeam.description && (
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{currentTeam.description}</p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
                <Card className="mt-5">
                    <CardHeader className="border-b">
                        <div className="flex flex-wrap items-center justify-between gap-3">
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
                        {isLoading ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Üyeler yükleniyor...</p>
                        ) : currentTeamMembers.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="mx-auto mb-3 size-10 text-muted-foreground/45" />
                                <p className="text-sm text-muted-foreground">Henüz üye yok</p>
                            </div>
                        ) : (
                            <div className="motion-stagger space-y-1">
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
                <Card className="mt-4">
                    <CardHeader className="border-b">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <CardTitle>Görevler</CardTitle>
                                <CardDescription>
                                    {isAdmin
                                        ? 'Takım görevlerini görüntüleyin ve yönetin'
                                        : 'Takım görevlerini görüntüleyin'}
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <TaskViewSwitcher value={taskView} onChange={setTaskView} />
                                {isAdmin && (
                                    <>
                                        <Button variant="outline" size="icon" onClick={() => setIsMetadataDialogOpen(true)} aria-label="Projeleri, etiketleri ve şablonları yönet"><Settings2 /></Button>
                                        <Button onClick={() => setIsCreateTaskDialogOpen(true)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Görev Oluştur
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingTasks ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Görevler yükleniyor...</p>
                        ) : tasks.length === 0 ? (
                            <div className="text-center py-8">
                                <ClipboardList className="mx-auto mb-3 size-10 text-muted-foreground/45" />
                                <p className="text-sm text-muted-foreground">Henüz görev yok</p>
                            </div>
                        ) : (
                            <>
                                <TaskFilterBar
                                    filters={taskFilters}
                                    onChange={setTaskFilters}
                                    resultCount={visibleTasks.length}
                                    totalCount={tasks.length}
                                    searchPlaceholder="Görev veya kişi ara..."
                                    assignees={taskAssignees}
                                    projects={projects}
                                    labels={labels}
                                />
                                {visibleTasks.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <p className="text-sm font-medium">Eşleşen görev bulunamadı</p>
                                        <p className="mt-1 text-xs text-muted-foreground">Aramanızı veya filtrelerinizi değiştirebilirsiniz.</p>
                                    </div>
                                ) : taskView === 'kanban' ? (
                                    <TaskKanbanBoard
                                        tasks={visibleTasks}
                                        isAdmin={isAdmin}
                                        currentUserId={user?.id || 0}
                                        isUpdating={isSubmittingTask}
                                        onStatusChange={handleTaskStatusChange}
                                        onEdit={handleEditTaskClick}
                                        onDelete={handleDeleteTaskClick}
                                    />
                                ) : taskView === 'calendar' ? (
                                    <TaskCalendarView
                                        tasks={visibleTasks}
                                    />
                                ) : (
                                    <div className="motion-stagger space-y-2">
                                        {visibleTasks.map((task) => (
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
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Add Member Dialog */}
                <AddMemberDialog
                    open={isAddMemberDialogOpen}
                    onOpenChange={setIsAddMemberDialogOpen}
                    onSubmit={handleAddMember}
                    isSubmitting={isSubmitting}
                />

                {/* Create Task Dialog */}
                <CreateTaskDialog
                    open={isCreateTaskDialogOpen}
                    onOpenChange={setIsCreateTaskDialogOpen}
                    onSubmit={handleCreateTask}
                    members={currentTeamMembers}
                    projects={projects}
                    labels={labels}
                    templates={templates}
                    isSubmitting={isSubmittingTask}
                />

                {/* Edit Task Dialog */}
                <EditTaskDialog
                    open={isEditTaskDialogOpen}
                    onOpenChange={setIsEditTaskDialogOpen}
                    onSubmit={handleUpdateTask}
                    task={taskToEdit}
                    members={currentTeamMembers}
                    projects={projects}
                    labels={labels}
                    isSubmitting={isSubmittingTask}
                />

                <TaskMetadataManager
                    open={isMetadataDialogOpen}
                    onOpenChange={setIsMetadataDialogOpen}
                    projects={projects}
                    labels={labels}
                    templates={templates}
                    isSubmitting={isSubmittingMetadata}
                    onCreate={createMetadata}
                    onDelete={deleteMetadata}
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
