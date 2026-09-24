'use client';

import Link from 'next/link';
import { Activity, ArrowRight, BarChart3, CheckCircle2, ClipboardList, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth-store';
import { useDashboardData } from '@/components/dashboard/dashboard-shell';
import { WorkspacePageHeader } from '@/components/dashboard/workspace-page-header';

export default function DashboardOverviewPage() {
    const { user } = useAuthStore();
    const { tasks, teams } = useDashboardData();
    const activeTasks = tasks.filter((task) => task.status === 'pending' || task.status === 'in_progress').length;
    const completedTasks = tasks.filter((task) => task.status === 'completed').length;
    const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return (
        <div className="mx-auto max-w-[1250px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <WorkspacePageHeader eyebrow="Genel bakış" title={`Merhaba, ${user?.name?.split(' ')[0] ?? ''}.`} description="Çalışma alanındaki ilerleme ve önceliklere göz at." action={<Button asChild size="sm"><Link href="/panel/gorevler">Görevlerime git <ArrowRight className="size-3.5" /></Link></Button>} />

            <section className="motion-stagger grid gap-3 sm:grid-cols-3" aria-label="Çalışma alanı özeti">
                <OverviewMetric label="Takımlar" value={String(teams.length)} note="Çalışma alanların" icon={Users} tone="bg-indigo-50 text-indigo-600" />
                <OverviewMetric label="Açık görevler" value={String(activeTasks)} note="Sıradaki işler" icon={ClipboardList} tone="bg-amber-50 text-amber-600" />
                <OverviewMetric label="Tamamlanma" value={`%${completionRate}`} note={`${completedTasks} görev tamamlandı`} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
            </section>

            <section className="mt-8">
                <div className="mb-4"><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-500">Kısayollar</p><h2 className="mt-1 text-base font-semibold tracking-tight text-slate-900">Çalışma alanını keşfet</h2></div>
                <div className="grid gap-3 md:grid-cols-3">
                    <QuickLink href="/panel/analitik" icon={BarChart3} title="Analitik" description="İlerleme ve takım iş yükünü incele." />
                    <QuickLink href="/panel/takimlar" icon={Users} title="Takımlar" description="Çalışma alanlarını görüntüle ve yönet." />
                    <QuickLink href="/panel/gorevler" icon={Activity} title="Görevler" description="Sana atanan işleri filtrele ve takip et." />
                </div>
            </section>

            <Card className="mt-5 overflow-hidden rounded-2xl border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-white to-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.025)]">
                <CardContent className="flex flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                    <div className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm"><Activity className="size-4" /></span><div><p className="text-xs font-semibold text-slate-800">{teams.length ? 'Akışın hazır' : 'İlk takımını oluştur'}</p><p className="mt-1 max-w-lg text-[10px] leading-5 text-slate-500">{teams.length ? 'Takım alanların, görevlerin ve analitiklerin çalışma alanı menüsünde seni bekliyor.' : 'Ekip arkadaşlarını davet et, görevleri paylaş ve ilerlemeyi tek yerden takip et.'}</p></div></div>
                    <Button asChild variant="outline" size="sm" className="shrink-0"><Link href="/panel/takimlar">{teams.length ? 'Takımları görüntüle' : 'Takım oluştur'} <ArrowRight className="size-3.5" /></Link></Button>
                </CardContent>
            </Card>
        </div>
    );
}

function OverviewMetric({ label, value, note, icon: Icon, tone }: { label: string; value: string; note: string; icon: typeof Users; tone: string }) {
    return <Card className="rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_12px_rgba(24,32,66,0.025)]"><CardContent className="flex min-h-[96px] items-center justify-between px-4 py-4 sm:px-5"><div><p className="text-[10px] text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold leading-none tracking-[-0.045em] text-slate-900">{value}</p><p className="mt-1.5 text-[9px] text-slate-400">{note}</p></div><span className={`flex size-9 items-center justify-center rounded-xl ${tone}`}><Icon className="size-4" /></span></CardContent></Card>;
}

function QuickLink({ href, icon: Icon, title, description }: { href: string; icon: typeof Users; title: string; description: string }) {
    return <Link href={href} className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"><Card className="h-full rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_12px_rgba(24,32,66,0.025)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-indigo-200 group-hover:shadow-[0_12px_30px_rgba(24,32,66,0.07)]"><CardContent className="flex items-start gap-3.5 px-4 py-4 sm:px-5"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon className="size-4" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800">{title}</span><span className="mt-1 block text-[10px] leading-5 text-slate-500">{description}</span></span><ArrowRight className="mt-1 size-3.5 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-600" /></CardContent></Card></Link>;
}
