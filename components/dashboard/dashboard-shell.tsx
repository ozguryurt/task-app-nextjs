'use client';

import { createContext, useCallback, useContext, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    CheckCircle2,
    Layers3,
    ListTodo,
    LogOut,
    Plus,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTeamStore, type Team } from '@/lib/store/team-store';
import { useTeams } from '@/lib/hooks/use-teams';
import { useUserTasks, type UserTask } from '@/lib/hooks/use-user-tasks';
import { useLogout } from '@/lib/hooks/use-logout';
import { TASKS_CHANGED_EVENT } from '@/lib/task-events';
import { UserAvatar } from '@/components/users/user-avatar';

interface DashboardData {
    tasks: UserTask[];
    teams: Team[];
    isLoadingTasks: boolean;
    isLoadingTeams: boolean;
    refreshTeams: () => Promise<Team[] | undefined>;
}

const DashboardDataContext = createContext<DashboardData | null>(null);

export function useDashboardData() {
    const data = useContext(DashboardDataContext);
    if (!data) throw new Error('useDashboardData DashboardShell içinde kullanılmalıdır');
    return data;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const teams = useTeamStore((state) => state.teams);
    const { fetchTeams, isLoading: isLoadingTeams } = useTeams();
    const { tasks, fetchUserTasks, isLoading: isLoadingTasks } = useUserTasks();
    const { handleLogout, isSubmitting: isLoggingOut } = useLogout();

    useEffect(() => {
        void fetchTeams().catch(() => {});
        void fetchUserTasks();
    }, [fetchTeams, fetchUserTasks]);

    useEffect(() => {
        const refreshTasks = () => void fetchUserTasks();
        window.addEventListener(TASKS_CHANGED_EVENT, refreshTasks);
        return () => window.removeEventListener(TASKS_CHANGED_EVENT, refreshTasks);
    }, [fetchUserTasks]);

    const refreshTeams = useCallback(() => fetchTeams(), [fetchTeams]);
    const navItems = [
        { href: '/panel/analitik', label: 'Analitik', icon: BarChart3, active: pathname === '/panel/analitik' },
        { href: '/panel/takimlar', label: 'Takımlar', icon: Users, active: pathname === '/panel/takimlar' || pathname.startsWith('/panel/takimlar/') },
        { href: '/panel/gorevler', label: 'Görevler', icon: ListTodo, active: pathname === '/panel/gorevler' },
    ];
    const contextValue: DashboardData = { tasks, teams, isLoadingTasks, isLoadingTeams, refreshTeams };

    return (
        <DashboardDataContext.Provider value={contextValue}>
            <main className="min-h-dvh bg-[#f6f8fc] text-slate-900">
                <div className="min-h-dvh w-full overflow-hidden bg-[#f6f8fc]">
                    <header className="flex h-[4.25rem] items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6">
                        <Link href="/panel" className="flex min-w-0 items-center gap-3">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-[0_5px_14px_rgba(55,70,180,0.24)]"><Layers3 className="size-4" /></span>
                            <span className="text-sm font-semibold tracking-[-0.025em]">Taskflow</span>
                            <span className="hidden h-4 w-px bg-slate-200 sm:block" />
                            <span className="hidden truncate text-xs text-slate-500 sm:block">Çalışma alanım</span>
                        </Link>
                        <div className="flex items-center gap-2.5 sm:gap-4">
                            <Link href="/panel/profil" aria-label="Profil ve hesap ayarları" className="flex items-center gap-2 rounded-full bg-slate-50 py-1 pl-1 pr-2 transition-colors hover:bg-indigo-50 sm:pr-3">
                                <UserAvatar name={user?.name} src={user?.avatarUrl} className="size-7" />
                                <span className="hidden max-w-32 truncate text-[11px] font-medium text-slate-700 sm:block">{user?.name}</span>
                            </Link>
                            <Button onClick={handleLogout} variant="ghost" size="icon-sm" disabled={isLoggingOut} aria-label="Çıkış yap" className="text-slate-500 hover:text-rose-600"><LogOut /></Button>
                        </div>
                    </header>

                    <div className="flex min-h-[calc(100dvh-4.25rem)]">
                        <aside className="hidden w-[205px] shrink-0 flex-col border-r border-slate-200/80 bg-[#f8f9fc] px-3 py-5 md:flex lg:w-[225px] lg:px-4">
                            <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.17em] text-slate-400">Çalışma alanı</p>
                            <nav className="space-y-1" aria-label="Çalışma alanı menüsü">
                                {navItems.map((item) => <SidebarLink key={item.href} {...item} count={item.href.endsWith('gorevler') ? tasks.filter((task) => task.status === 'pending' || task.status === 'in_progress').length : undefined} />)}
                            </nav>

                            <div className="mb-2 mt-8 flex items-center justify-between px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400"><span>Takımlarım</span><Link href="/panel/takimlar" className="rounded p-0.5 text-slate-400 hover:bg-white hover:text-indigo-600" aria-label="Takımları aç"><Plus className="size-3.5" /></Link></div>
                            <div className="space-y-0.5">
                                {teams.slice(0, 5).map((team, index) => <Link key={team.id} href={`/panel/takimlar/${team.id}`} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] text-slate-600 transition-colors hover:bg-white hover:text-slate-900"><span className={`size-2 rounded-full ${['bg-violet-400', 'bg-sky-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400'][index]}`} /><span className="truncate">{team.name}</span></Link>)}
                            </div>

                            <Link href="/panel/profil" className="mt-auto block rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-3 transition-colors hover:border-indigo-200 hover:from-indigo-100/70" aria-label="Profil ve hesap ayarları">
                                <span className="flex size-7 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm"><CheckCircle2 className="size-3.5" /></span>
                                <p className="mt-2 text-[10px] font-semibold text-slate-700">Hesap durumu</p>
                                <p className="mt-0.5 truncate text-[9px] text-slate-500">{user?.email}</p>
                                <Badge variant={user?.emailVerified ? 'secondary' : 'outline'} className={`mt-2 ${user?.emailVerified ? 'bg-emerald-50 text-emerald-700' : 'text-amber-700'}`}>{user?.emailVerified ? 'E-posta doğrulandı' : 'Doğrulama bekliyor'}</Badge>
                            </Link>
                        </aside>

                        <div className="min-w-0 flex-1">
                            <nav className="flex gap-1 overflow-x-auto border-b border-slate-200/80 bg-white px-4 py-2 md:hidden" aria-label="Çalışma alanı menüsü">
                                {navItems.map((item) => <MobileNavLink key={item.href} {...item} />)}
                            </nav>
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </DashboardDataContext.Provider>
    );
}

function SidebarLink({ href, icon: Icon, label, count, active }: { href: string; icon: typeof ListTodo; label: string; count?: number; active: boolean }) {
    return <Link href={href} aria-current={active ? 'page' : undefined} className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[11px] transition-colors ${active ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}><Icon className="size-3.5" /><span>{label}</span>{count !== undefined && <span className={`ml-auto text-[9px] ${active ? 'text-indigo-500' : 'text-slate-400'}`}>{count}</span>}</Link>;
}

function MobileNavLink({ href, icon: Icon, label, active }: { href: string; icon: typeof ListTodo; label: string; active: boolean }) {
    return <Link href={href} aria-current={active ? 'page' : undefined} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-medium transition-colors ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'}`}><Icon className="size-3.5" />{label}</Link>;
}
