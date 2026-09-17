'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTeamStore } from '@/lib/store/team-store';
import { useTeams } from '@/lib/hooks/use-teams';
import { useUserTasks } from '@/lib/hooks/use-user-tasks';
import { useLogout } from '@/lib/hooks/use-logout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateTeamDialog } from '@/components/teams/create-team-dialog';
import { TeamCard } from '@/components/teams/team-card';
import { UserTaskItem } from '@/components/dashboard/user-task-item';
import { TaskFilterBar } from '@/components/tasks/task-filter-bar';
import { defaultTaskFilters, filterTasks, type TaskFilterState } from '@/lib/task-filters';
import { CalendarDays, CheckCircle2, ClipboardList, Layers3, LogOut, Mail, Plus, Users, UserRound } from 'lucide-react';

export default function DashboardPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [taskFilters, setTaskFilters] = useState<TaskFilterState>({ ...defaultTaskFilters });
    const { handleLogout, isSubmitting } = useLogout();
    const { user } = useAuthStore();
    const { teams } = useTeamStore();
    const { fetchTeams, isLoading } = useTeams();
    const { tasks: userTasks, fetchUserTasks, isLoading: isLoadingTasks } = useUserTasks();

    useEffect(() => {
        // Hata durumları ilgili hook içinde toast bildirimi olarak gösterilir
        fetchTeams().catch(() => {});
        fetchUserTasks();
    }, []);

    const activeTasks = userTasks.filter((task) => task.status !== 'completed' && task.status !== 'cancelled');
    const completedTasks = userTasks.filter((task) => task.status === 'completed');
    const visibleTasks = useMemo(
        () => filterTasks(userTasks, taskFilters, (task) => `${task.team_name} ${task.assigned_by_name}`),
        [userTasks, taskFilters]
    );

    return (
        <main className="min-h-screen pb-10">
            <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-md">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-8 items-center justify-center rounded-md bg-primary text-white"><Layers3 className="size-4" /></span>
                        <div><p className="text-sm font-semibold tracking-tight">Taskflow</p><p className="text-[10px] text-muted-foreground">Çalışma alanı</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block"><p className="text-xs font-semibold">{user?.name}</p><p className="text-[11px] text-muted-foreground">{user?.email}</p></div>
                        <span className="flex size-8 items-center justify-center rounded-full border bg-secondary text-xs font-semibold text-primary">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                        <Button onClick={handleLogout} variant="ghost" size="icon" disabled={isSubmitting} aria-label="Çıkış yap"><LogOut /></Button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div><p className="mb-1 text-xs font-medium text-muted-foreground">Genel bakış</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Merhaba, {user?.name?.split(' ')[0]}.</h1><p className="mt-1 text-sm text-muted-foreground">Bugünün önceliklerini ve ekiplerini tek ekrandan yönet.</p></div>
                    <Button onClick={() => setIsCreateDialogOpen(true)}><Plus /> Yeni takım</Button>
                </div>

                <section className="motion-stagger mb-4 grid gap-3 sm:grid-cols-3">
                    <Card className="py-3"><CardContent className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Takımlar</p><p className="mt-1 text-xl font-semibold tracking-tight">{teams.length}</p></div><Users className="size-4 text-muted-foreground" /></CardContent></Card>
                    <Card className="py-3"><CardContent className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Aktif görevler</p><p className="mt-1 text-xl font-semibold tracking-tight">{activeTasks.length}</p></div><ClipboardList className="size-4 text-muted-foreground" /></CardContent></Card>
                    <Card className="py-3"><CardContent className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Tamamlanan</p><p className="mt-1 text-xl font-semibold tracking-tight">{completedTasks.length}</p></div><CheckCircle2 className="size-4 text-muted-foreground" /></CardContent></Card>
                </section>

                <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <Card className="min-w-0">
                        <CardHeader className="border-b"><div className="flex items-center justify-between"><div><CardTitle>Bana atananlar</CardTitle><CardDescription className="mt-1">{activeTasks.length} aktif görev seni bekliyor</CardDescription></div><Badge variant="outline">{userTasks.length} toplam</Badge></div></CardHeader>
                        <CardContent>
                            {isLoadingTasks ? (
                                <div className="space-y-2">{[1,2,3].map((item) => <div key={item} className="h-18 animate-pulse rounded-md bg-muted" />)}</div>
                            ) : userTasks.length === 0 ? (
                                <div className="flex flex-col items-center py-10 text-center"><span className="mb-3 flex size-9 items-center justify-center rounded-md bg-secondary text-primary"><ClipboardList className="size-4" /></span><p className="text-sm font-semibold">Görev kutun temiz</p><p className="mt-1 text-xs text-muted-foreground">Yeni görevler atandığında burada görünecek.</p></div>
                            ) : (
                                <>
                                    <TaskFilterBar
                                        filters={taskFilters}
                                        onChange={setTaskFilters}
                                        resultCount={visibleTasks.length}
                                        totalCount={userTasks.length}
                                        searchPlaceholder="Görev veya takım ara..."
                                    />
                                    {visibleTasks.length === 0 ? (
                                        <div className="py-10 text-center">
                                            <p className="text-sm font-medium">Eşleşen görev bulunamadı</p>
                                            <p className="mt-1 text-xs text-muted-foreground">Aramanızı veya filtrelerinizi değiştirebilirsiniz.</p>
                                        </div>
                                    ) : (
                                        <div className="motion-stagger max-h-[480px] space-y-1 overflow-y-auto pr-1">
                                            {visibleTasks.map((task) => <UserTaskItem key={task.id} task={task} />)}
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader><CardTitle className="text-base">Profil özeti</CardTitle><CardDescription>Hesap ve üyelik bilgilerin</CardDescription></CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-primary"><UserRound className="size-4" /></span><div className="min-w-0"><p className="text-[11px] text-muted-foreground">Ad soyad</p><p className="truncate font-medium">{user?.name}</p></div></div>
                            <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-primary"><Mail className="size-4" /></span><div className="min-w-0"><p className="text-[11px] text-muted-foreground">E-posta</p><p className="truncate font-medium">{user?.email}</p></div></div>
                            <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-primary"><CalendarDays className="size-4" /></span><div><p className="text-[11px] text-muted-foreground">Katılım tarihi</p><p className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}</p></div></div>
                            <div className="border-t pt-4"><Badge variant={user?.emailVerified ? 'secondary' : 'outline'} className={user?.emailVerified ? 'bg-emerald-50 text-emerald-700' : 'text-amber-700'}>{user?.emailVerified ? <><CheckCircle2 /> E-posta doğrulandı</> : 'Doğrulama bekliyor'}</Badge></div>
                        </CardContent>
                    </Card>
                </section>

                <section className="mt-7">
                    <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-medium text-muted-foreground">Çalışma alanları</p><h2 className="mt-1 text-lg font-semibold tracking-tight">Takımlarım</h2></div><span className="text-xs text-muted-foreground">{teams.length} takım</span></div>
                    {isLoading ? (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl bg-muted" />)}</div>
                    ) : teams.length === 0 ? (
                        <Card><CardContent className="flex flex-col items-center py-9 text-center"><span className="mb-3 flex size-9 items-center justify-center rounded-md bg-secondary text-primary"><Users className="size-4" /></span><h3 className="font-semibold">İlk takımını oluştur</h3><p className="mb-4 mt-1 max-w-sm text-sm text-muted-foreground">Ekip arkadaşlarını davet et, görevleri paylaş ve ilerlemeyi tek yerden takip et.</p><Button onClick={() => setIsCreateDialogOpen(true)}><Plus /> Takım oluştur</Button></CardContent></Card>
                    ) : <div className="motion-stagger grid gap-4 md:grid-cols-2 lg:grid-cols-3">{teams.map((team) => <TeamCard key={team.id} team={team} />)}</div>}
                </section>

                <CreateTeamDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSuccess={fetchTeams} />
            </div>
        </main>
    );
}
