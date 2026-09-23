'use client';

import { useState } from 'react';
import { CheckCircle2, ListTodo } from 'lucide-react';
import { useDashboardData } from '@/components/dashboard/dashboard-shell';
import { UserTaskItem } from '@/components/dashboard/user-task-item';
import { TaskFilterBar } from '@/components/tasks/task-filter-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { defaultTaskFilters, filterTasks, type TaskFilterState } from '@/lib/task-filters';

export default function AssignedTasksPage() {
    const { tasks, isLoadingTasks } = useDashboardData();
    const [filters, setFilters] = useState<TaskFilterState>({ ...defaultTaskFilters });
    const visibleTasks = filterTasks(tasks, filters, (task) => `${task.team_name} ${task.assigned_by_name} ${task.project_name ?? ''} ${task.labels?.map((label) => label.name).join(' ') ?? ''}`);
    const openTasks = tasks.filter((task) => task.status === 'pending' || task.status === 'in_progress').length;
    const completedTasks = tasks.filter((task) => task.status === 'completed').length;

    return (
        <div className="mx-auto max-w-[1250px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-5"><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-500">Çalışma alanı</p><h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.045em] text-slate-900 sm:text-[1.75rem]">Görevler</h1><p className="mt-1 text-xs text-slate-500 sm:text-sm">Sana atanan görevleri ara, filtrele ve takip et.</p></div>

            <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <TaskSummary label="Açık görev" value={openTasks} icon={ListTodo} tone="bg-indigo-50 text-indigo-600" />
                <TaskSummary label="Tamamlandı" value={completedTasks} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
            </div>

            <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5"><div><p className="text-xs font-semibold text-slate-800">Bana atanan görevler</p><p className="mt-1 text-[10px] text-slate-500">{tasks.length} görev toplam</p></div></div>
                <CardContent className="px-3 py-3 sm:px-4 sm:py-4">
                    <TaskFilterBar filters={filters} onChange={setFilters} resultCount={visibleTasks.length} totalCount={tasks.length} searchPlaceholder="Görev, takım veya proje ara..." />
                    {isLoadingTasks ? <div className="space-y-2">{[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div> : visibleTasks.length ? <div className="motion-stagger max-h-[min(68vh,720px)] divide-y divide-slate-100 overflow-y-auto">{visibleTasks.map((task) => <UserTaskItem key={task.id} task={task} />)}</div> : <div className="flex flex-col items-center py-12 text-center"><span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><ListTodo className="size-4" /></span><p className="text-xs font-semibold text-slate-800">{tasks.length ? 'Eşleşen görev bulunamadı' : 'Görev kutun temiz'}</p><p className="mt-1 text-[10px] text-slate-500">{tasks.length ? 'Arama veya filtreleri değiştirebilirsin.' : 'Yeni görevler atandığında burada görünecek.'}</p>{tasks.length > 0 && <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFilters({ ...defaultTaskFilters })}>Filtreleri temizle</Button>}</div>}
                </CardContent>
            </Card>
        </div>
    );
}

function TaskSummary({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof ListTodo; tone: string }) {
    return <Card className="rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_12px_rgba(24,32,66,0.025)]"><CardContent className="flex items-center justify-between px-4 py-4"><div><p className="text-[10px] text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{value}</p></div><span className={`flex size-9 items-center justify-center rounded-xl ${tone}`}><Icon className="size-4" /></span></CardContent></Card>;
}
