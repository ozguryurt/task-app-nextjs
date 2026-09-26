'use client';

import { useEffect, useMemo, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTeamStore, Task, type TaskProject } from '@/lib/store/team-store';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ColorSwatches } from '@/components/ui/color-swatches';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Users, UserPlus, Trash2, Calendar, ClipboardList, Plus, Settings2, FolderKanban, Pencil, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboardData } from '@/components/dashboard/dashboard-shell';
import { notifyTasksChanged } from '@/lib/task-events';

interface PageProps {
    params: Promise<{ takimId: string }>;
}

export default function TeamDetailPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const teamId = parseInt(resolvedParams.takimId);
    const router = useRouter();
    const { refreshTeams } = useDashboardData();
    const { user } = useAuthStore();
    const { currentTeam, currentTeamMembers, setCurrentTeam, setCurrentTeamMembers, setCurrentTeamTasks } = useTeamStore();
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
    const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false);
    const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<{ id: number; title: string } | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<{ id: number; name: string } | null>(null);
    const [projectToEdit, setProjectToEdit] = useState<TaskProject | null>(null);
    const [teamNameDraft, setTeamNameDraft] = useState('');
    const [teamDescriptionDraft, setTeamDescriptionDraft] = useState('');
    const [projectColorDraft, setProjectColorDraft] = useState('#6366f1');
    const [isLoadingTeam, setIsLoadingTeam] = useState(true);
    const [isDeletingTeam, setIsDeletingTeam] = useState(false);
    const [teamError, setTeamError] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');

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
        projects, labels, templates, fetchMetadata, createMetadata, updateMetadata, deleteMetadata,
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
                cache: 'no-store',
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

    useEffect(() => {
        let active = true;
        const revalidateAccess = async () => {
            if (document.visibilityState !== 'visible') return;
            try {
                const response = await fetch(`/api/takimlar/${teamId}`, { credentials: 'include', cache: 'no-store' });
                if (!active) return;
                if (response.status === 401 || response.status === 403 || response.status === 404) {
                    setCurrentTeam(null);
                    setCurrentTeamMembers([]);
                    setCurrentTeamTasks([]);
                    setUserRole(null);
                    setTeamError('Bu takıma erişim yetkiniz yok');
                } else if (response.ok) {
                    const data = await response.json();
                    if (active) setUserRole(data.userRole);
                }
            } catch {
                // Geçici ağ hatasında mevcut görünümü değiştirme.
            }
        };
        window.addEventListener('focus', revalidateAccess);
        const interval = window.setInterval(() => void revalidateAccess(), 60_000);
        return () => { active = false; window.removeEventListener('focus', revalidateAccess); window.clearInterval(interval); };
    }, [teamId, setCurrentTeam, setCurrentTeamMembers, setCurrentTeamTasks]);

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
            notifyTasksChanged();
            void refreshTeams().catch(() => {});
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

    const handleConfirmDeleteProject = async () => {
        if (!projectToDelete) return;
        const deleted = await deleteMetadata('project', projectToDelete.id);
        if (deleted) {
            setIsDeleteProjectDialogOpen(false);
            setProjectToDelete(null);
        }
    };

    if (isLoadingTeam) {
        return <TeamDetailSkeleton />;
    }

    if (teamError) {
        return (
            <div className="min-h-[calc(100dvh-4.25rem)] bg-[#f6f8fc] py-8">
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

    const handleCreateProject = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!projectName.trim()) return;
        const payload = { type: 'project' as const, name: projectName.trim(), description: projectDescription.trim(), color: projectColorDraft };
        const saved = projectToEdit
            ? await updateMetadata({ ...payload, id: projectToEdit.id })
            : await createMetadata(payload);
        if (saved) {
            cancelProjectEdit();
        }
    };

    const openCreateProjectDialog = () => {
        setProjectToEdit(null);
        setProjectName('');
        setProjectDescription('');
        setProjectColorDraft('#6366f1');
        setIsProjectDialogOpen(true);
    };

    const startEditingProject = (project: TaskProject) => {
        setProjectToEdit(project);
        setProjectName(project.name);
        setProjectDescription(project.description ?? '');
        setProjectColorDraft(project.color);
        setIsProjectDialogOpen(true);
    };

    const cancelProjectEdit = () => {
        setIsProjectDialogOpen(false);
        setProjectToEdit(null);
        setProjectName('');
        setProjectDescription('');
        setProjectColorDraft('#6366f1');
    };

    const openTeamEditor = () => {
        setTeamNameDraft(currentTeam?.name ?? '');
        setTeamDescriptionDraft(currentTeam?.description ?? '');
        setIsEditTeamDialogOpen(true);
    };

    const handleUpdateTeam = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await fetch(`/api/takimlar/${teamId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: teamNameDraft, description: teamDescriptionDraft }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Takım güncellenemedi');
            if (currentTeam) setCurrentTeam({ ...currentTeam, name: teamNameDraft.trim(), description: teamDescriptionDraft.trim() || null });
            void refreshTeams().catch(() => {});
            setIsEditTeamDialogOpen(false);
            toast.success('Takım bilgileri güncellendi');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Takım güncellenemedi');
        }
    };

    return (
        <div className="min-h-[calc(100dvh-4.25rem)] bg-[#f6f8fc] text-slate-900">
            <div className="mx-auto max-w-[1250px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                        <div className="flex-1">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-500">Takım çalışma alanı</p>
                            <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.045em] text-slate-900 sm:text-[1.75rem]">{currentTeam.name}</h1>
                            {currentTeam.description && (
                                <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-500 sm:text-sm">{currentTeam.description}</p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500">
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
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={openTeamEditor}><Pencil className="size-3.5" /> Takımı düzenle</Button>
                                <Button variant="destructive" size="sm" onClick={handleDeleteTeamClick}><Trash2 className="size-3.5" /> Takımı sil</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Members Section */}
                <Card className="mt-5 overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                    <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5">
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
                    <CardContent className="py-4">
                        {isLoading ? (
                            <div aria-busy="true" className="space-y-3 py-2">{[1, 2, 3].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl px-2 py-2"><Skeleton className="size-10 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-2.5 w-48 max-w-[70%]" /></div><Skeleton className="h-6 w-16 rounded-full" /></div>)}</div>
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

                {/* Projects Section */}
                <Card className="mt-4 overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                    <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <CardTitle>Projeler</CardTitle>
                                <CardDescription>Takım görevlerini projeler altında düzenleyin</CardDescription>
                            </div>
                            <div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{projects.length} proje</span>{isAdmin && <Button size="sm" onClick={openCreateProjectDialog}><Plus className="size-3.5" /> Proje ekle</Button>}</div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 py-4">
                        {projects.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
                                <FolderKanban className="mx-auto mb-2 size-8 text-slate-300" />
                                <p className="text-sm font-medium text-slate-700">Henüz proje yok</p>
                                <p className="mt-1 text-xs text-slate-500">Projeler görevleri ortak hedefler altında toplar.</p>
                            </div>
                        ) : (
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {projects.map((project) => (
                                    <div key={project.id} className="flex min-w-0 items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-muted/60">
                                        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${project.color}18`, color: project.color }}><FolderKanban className="size-4" /></span>
                                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{project.name}</p><p className="mt-1 line-clamp-2 min-h-8 text-xs leading-4 text-muted-foreground">{project.description || 'Bu proje için açıklama eklenmemiş.'}</p></div>
                                        {isAdmin && <div className="flex shrink-0 items-center gap-0.5"><Button type="button" variant="ghost" size="icon-sm" aria-label={`${project.name} projesini düzenle`} disabled={isSubmittingMetadata} onClick={() => startEditingProject(project)} className="text-muted-foreground"><Pencil /></Button><Button type="button" variant="ghost" size="icon-sm" aria-label={`${project.name} projesini sil`} disabled={isSubmittingMetadata} onClick={() => { setProjectToDelete({ id: project.id, name: project.name }); setIsDeleteProjectDialogOpen(true); }} className="text-muted-foreground hover:text-destructive"><Trash2 /></Button></div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tasks Section */}
                <Card className="mt-4 overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                    <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5">
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
                                        <Button variant="outline" size="icon" onClick={() => setIsMetadataDialogOpen(true)} aria-label="Etiketleri ve şablonları yönet"><Settings2 /></Button>
                                        <Button onClick={() => setIsCreateTaskDialogOpen(true)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Görev Oluştur
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 py-4">
                        {isLoadingTasks ? (
                            <div aria-busy="true" className="space-y-2 py-1">{[1, 2, 3].map((item) => <div key={item} className="space-y-3 rounded-xl border border-slate-200/70 p-3.5"><div className="flex gap-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-5 w-16 rounded-full" /></div><Skeleton className="h-3 w-2/3" /><div className="flex gap-4"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-20" /></div></div>)}</div>
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
                    onUpdate={updateMetadata}
                    onDelete={deleteMetadata}
                />

                <Dialog open={isEditTeamDialogOpen} onOpenChange={setIsEditTeamDialogOpen}>
                    <DialogContent>
                        <form onSubmit={handleUpdateTeam} className="space-y-5">
                            <DialogHeader><DialogTitle>Takımı düzenle</DialogTitle><DialogDescription>Takım adını ve açıklamasını güncelleyin.</DialogDescription></DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2"><Label htmlFor="team-name">Takım adı</Label><Input id="team-name" value={teamNameDraft} onChange={(event) => setTeamNameDraft(event.target.value)} maxLength={255} required /></div>
                                <div className="space-y-2"><Label htmlFor="team-description">Açıklama</Label><Textarea id="team-description" value={teamDescriptionDraft} onChange={(event) => setTeamDescriptionDraft(event.target.value)} maxLength={10000} rows={4} /></div>
                            </div>
                            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsEditTeamDialogOpen(false)}>İptal</Button><Button type="submit" disabled={!teamNameDraft.trim()}><Save /> Değişiklikleri kaydet</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isProjectDialogOpen} onOpenChange={(open) => { setIsProjectDialogOpen(open); if (!open) { setProjectToEdit(null); setProjectName(''); setProjectDescription(''); setProjectColorDraft('#6366f1'); } }}>
                    <DialogContent>
                        <form onSubmit={handleCreateProject} className="space-y-5">
                            <DialogHeader><DialogTitle>{projectToEdit ? 'Projeyi düzenle' : 'Yeni proje'}</DialogTitle><DialogDescription>{projectToEdit ? 'Proje bilgilerini güncelleyin.' : 'Takım görevlerini düzenlemek için yeni bir proje oluşturun.'}</DialogDescription></DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2"><Label htmlFor="project-name">Proje adı</Label><Input id="project-name" value={projectName} onChange={(event) => setProjectName(event.target.value)} maxLength={120} placeholder="Örn. Web sitesi yenileme" required /></div>
                                <div className="space-y-2"><Label htmlFor="project-description">Açıklama <span className="font-normal text-muted-foreground">(isteğe bağlı)</span></Label><Textarea id="project-description" value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} maxLength={500} rows={3} placeholder="Projenin kapsamını kısaca açıklayın" /></div>
                                <div className="space-y-2"><Label>Proje rengi</Label><ColorSwatches value={projectColorDraft} onChange={setProjectColorDraft} label="Proje rengi" /></div>
                            </div>
                            <DialogFooter><Button type="button" variant="outline" onClick={cancelProjectEdit}>İptal</Button><Button type="submit" disabled={isSubmittingMetadata || !projectName.trim()}>{projectToEdit ? <><Save /> Değişiklikleri kaydet</> : <><Plus /> Proje ekle</>}</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

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

                {/* Delete Project Confirmation Dialog */}
                <ConfirmDialog
                    open={isDeleteProjectDialogOpen}
                    onOpenChange={(open) => {
                        setIsDeleteProjectDialogOpen(open);
                        if (!open) setProjectToDelete(null);
                    }}
                    onConfirm={handleConfirmDeleteProject}
                    title="Projeyi Sil"
                    description={projectToDelete ? `“${projectToDelete.name}” projesini silmek istediğinize emin misiniz? Bu projeye bağlı görevler proje bağlantısı olmadan kalabilir.` : ''}
                    confirmText="Evet, Projeyi Sil"
                    cancelText="Vazgeç"
                    isDestructive
                    isLoading={isSubmittingMetadata}
                />
            </div>
        </div>
    );
}

function TeamDetailSkeleton() {
    return (
        <div className="min-h-[calc(100dvh-4.25rem)] bg-[#f6f8fc]">
            <div aria-busy="true" className="mx-auto max-w-[1250px] space-y-4 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
                <div className="mb-6 space-y-3"><Skeleton className="h-2.5 w-32" /><Skeleton className="h-8 w-56" /><Skeleton className="h-4 w-80 max-w-full" /><Skeleton className="h-3 w-44" /></div>
                <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                    <div className="border-b border-slate-100 px-4 py-4 sm:px-5"><Skeleton className="h-4 w-32" /><Skeleton className="mt-2 h-3 w-44" /></div>
                    <div className="space-y-3 p-4">{[1, 2].map((item) => <div key={item} className="flex items-center gap-3"><Skeleton className="size-10 rounded-xl" /><div className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-2.5 w-40" /></div></div>)}</div>
                </Card>
                <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                    <div className="border-b border-slate-100 px-4 py-4 sm:px-5"><Skeleton className="h-4 w-24" /><Skeleton className="mt-2 h-3 w-56" /></div>
                    <div className="space-y-3 p-4">{[1, 2, 3].map((item) => <div key={item} className="space-y-3 rounded-xl border border-slate-200/70 p-3.5"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-2/3" /><Skeleton className="h-3 w-1/2" /></div>)}</div>
                </Card>
            </div>
        </div>
    );
}
