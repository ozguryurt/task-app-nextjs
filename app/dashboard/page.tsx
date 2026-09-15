'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTeamStore } from '@/lib/store/team-store';
import { useTeams } from '@/lib/hooks/use-teams';
import { useUserTasks } from '@/lib/hooks/use-user-tasks';
import { useLogout } from '@/lib/hooks/use-logout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { CreateTeamDialog } from '@/components/teams/create-team-dialog';
import { TeamCard } from '@/components/teams/team-card';
import { UserTaskItem } from '@/components/dashboard/user-task-item';
import { CalendarDays, CheckCircle2, ClipboardList, Layers3, LogOut, Mail, Plus, Users, UserRound } from 'lucide-react';

export default function DashboardPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const { handleLogout, isSubmitting } = useLogout();
    const { user } = useAuthStore();
    const { teams } = useTeamStore();
    const { fetchTeams, isLoading } = useTeams();
    const { tasks: userTasks, fetchUserTasks, isLoading: isLoadingTasks, error: tasksError } = useUserTasks();

    useEffect(() => {
        fetchTeams();
        fetchUserTasks();
    }, []);

    const activeTasks = userTasks.filter((task) => task.status !== 'completed' && task.status !== 'cancelled');
    const completedTasks = userTasks.filter((task) => task.status === 'completed');

    return (
        <main className="min-h-screen pb-12">
            <header className="sticky top-0 z-20 border-b border-black/[0.04] bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20"><Layers3 className="size-4.5" /></span>
                        <div><p className="text-sm font-bold tracking-tight">Taskflow</p><p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Workspace</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block"><p className="text-xs font-semibold">{user?.name}</p><p className="text-[11px] text-muted-foreground">{user?.email}</p></div>
                        <span className="flex size-9 items-center justify-center rounded-full border bg-white text-sm font-bold text-primary shadow-sm">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                        <Button onClick={handleLogout} variant="ghost" size="icon" disabled={isSubmitting} aria-label="Çıkış yap"><LogOut /></Button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
                <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div><Badge variant="secondary" className="mb-3 rounded-full text-primary">Genel bakış</Badge><h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Merhaba, {user?.name?.split(' ')[0]}.</h1><p className="mt-2 text-sm text-muted-foreground">Bugünün önceliklerini ve ekiplerini tek ekrandan yönet.</p></div>
                    <Button onClick={() => setIsCreateDialogOpen(true)}><Plus /> Yeni takım</Button>
                </div>

                <section className="mb-5 grid gap-3 sm:grid-cols-3">
                    <Card className="py-4"><CardContent className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Takımlar</p><p className="mt-1 text-2xl font-bold tracking-tight">{teams.length}</p></div><span className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Users /></span></CardContent></Card>
                    <Card className="py-4"><CardContent className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Aktif görevler</p><p className="mt-1 text-2xl font-bold tracking-tight">{activeTasks.length}</p></div><span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><ClipboardList /></span></CardContent></Card>
                    <Card className="py-4"><CardContent className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Tamamlanan</p><p className="mt-1 text-2xl font-bold tracking-tight">{completedTasks.length}</p></div><span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 /></span></CardContent></Card>
                </section>

                <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <Card className="min-w-0">
                        <CardHeader className="border-b"><div className="flex items-center justify-between"><div><CardTitle>Bana atananlar</CardTitle><CardDescription className="mt-1">{activeTasks.length} aktif görev seni bekliyor</CardDescription></div><Badge variant="outline">{userTasks.length} toplam</Badge></div></CardHeader>
                        <CardContent>
                            {tasksError && <Alert variant="destructive" className="mb-4">{tasksError}</Alert>}
                            {isLoadingTasks ? (
                                <div className="space-y-3">{[1,2,3].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>
                            ) : userTasks.length === 0 ? (
                                <div className="flex flex-col items-center py-12 text-center"><span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary"><ClipboardList /></span><p className="text-sm font-semibold">Görev kutun temiz</p><p className="mt-1 text-xs text-muted-foreground">Yeni görevler atandığında burada görünecek.</p></div>
                            ) : <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">{userTasks.map((task) => <UserTaskItem key={task.id} task={task} />)}</div>}
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

                <section className="mt-8">
                    <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Çalışma alanları</p><h2 className="mt-1 text-xl font-bold tracking-tight">Takımlarım</h2></div><span className="text-xs text-muted-foreground">{teams.length} takım</span></div>
                    {isLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-muted" />)}</div>
                    ) : teams.length === 0 ? (
                        <Card><CardContent className="flex flex-col items-center py-10 text-center"><span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary"><Users /></span><h3 className="font-semibold">İlk takımını oluştur</h3><p className="mb-4 mt-1 max-w-sm text-sm text-muted-foreground">Ekip arkadaşlarını davet et, görevleri paylaş ve ilerlemeyi tek yerden takip et.</p><Button onClick={() => setIsCreateDialogOpen(true)}><Plus /> Takım oluştur</Button></CardContent></Card>
                    ) : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{teams.map((team) => <TeamCard key={team.id} team={team} />)}</div>}
                </section>

                <CreateTeamDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSuccess={fetchTeams} />
            </div>
        </main>
    );
}
