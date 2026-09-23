'use client';

import { AlertTriangle, CalendarClock, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserTask } from '@/lib/hooks/use-user-tasks';

const statusConfig = [
    { key: 'pending', label: 'Beklemede', color: 'bg-amber-400' },
    { key: 'in_progress', label: 'Devam ediyor', color: 'bg-indigo-500' },
    { key: 'completed', label: 'Tamamlandı', color: 'bg-emerald-500' },
    { key: 'cancelled', label: 'İptal', color: 'bg-slate-400' },
] as const;

export function TaskAnalytics({ tasks }: { tasks: UserTask[] }) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const active = tasks.filter((task) => task.status === 'pending' || task.status === 'in_progress');
    const overdue = active.filter((task) => task.due_date && new Date(task.due_date) < today).length;
    const dueSoon = active.filter((task) => {
        if (!task.due_date) return false;
        const due = new Date(task.due_date);
        return due >= today && due <= nextWeek;
    }).length;
    const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
    const teamCounts = Array.from(tasks.reduce((map, task) => map.set(task.team_name, (map.get(task.team_name) ?? 0) + 1), new Map<string, number>()))
        .sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxTeamCount = Math.max(1, ...teamCounts.map(([, count]) => count));

    return (
        <section className="mt-8">
            <div className="mb-4"><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-500">Performans</p><h2 className="mt-1 text-base font-semibold tracking-tight text-slate-900">Görev analitiği</h2></div>
            <div className="grid gap-3 lg:grid-cols-2">
                <Card className="rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_12px_rgba(24,32,66,0.025)]">
                    <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5"><CardTitle className="text-sm text-slate-800">Genel ilerleme</CardTitle><CardDescription className="text-[10px]">Atanan tüm görevlerin durum özeti</CardDescription></CardHeader>
                    <CardContent className="py-4">
                        <div className="mb-5 grid grid-cols-3 gap-2">
                            <Metric icon={TrendingUp} label="Tamamlanma" value={`%${completionRate}`} />
                            <Metric icon={AlertTriangle} label="Geciken" value={String(overdue)} tone={overdue ? 'danger' : 'default'} />
                            <Metric icon={CalendarClock} label="7 gün içinde" value={String(dueSoon)} />
                        </div>
                        <div className="space-y-3">
                            {statusConfig.map((status) => {
                                const count = tasks.filter((task) => task.status === status.key).length;
                                const percent = tasks.length ? (count / tasks.length) * 100 : 0;
                                return <div key={status.key}><div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">{status.label}</span><span className="font-medium">{count}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full transition-[width] duration-500 ${status.color}`} style={{ width: `${percent}%` }} /></div></div>;
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_12px_rgba(24,32,66,0.025)]">
                    <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5"><CardTitle className="text-sm text-slate-800">Takım iş yükü</CardTitle><CardDescription className="text-[10px]">Görevlerin takımlara göre dağılımı</CardDescription></CardHeader>
                    <CardContent className="py-4">
                        {teamCounts.length === 0 ? <div className="flex min-h-44 items-center justify-center text-sm text-muted-foreground">Analiz edilecek görev bulunmuyor.</div> : <div className="space-y-4">{teamCounts.map(([team, count]) => <div key={team}><div className="mb-1.5 flex items-center justify-between gap-3"><span className="truncate text-sm font-medium">{team}</span><span className="text-xs text-muted-foreground">{count} görev</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary/75 transition-[width] duration-500" style={{ width: `${(count / maxTeamCount) * 100}%` }} /></div></div>)}</div>}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}

function Metric({ icon: Icon, label, value, tone = 'default' }: { icon: typeof CheckCircle2; label: string; value: string; tone?: 'default' | 'danger' }) {
    return <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"><Icon className={`mb-2 size-4 ${tone === 'danger' ? 'text-rose-500' : 'text-indigo-600'}`} /><p className="text-lg font-semibold tracking-tight text-slate-900">{value}</p><p className="text-[9px] text-slate-500">{label}</p></div>;
}
