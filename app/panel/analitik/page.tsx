'use client';

import { useDashboardData } from '@/components/dashboard/dashboard-shell';
import { TaskAnalytics } from '@/components/dashboard/task-analytics';

export default function AnalyticsPage() {
    const { tasks, isLoadingTasks } = useDashboardData();

    return (
        <div className="mx-auto max-w-[1250px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-5"><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-500">Çalışma alanı</p><h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.045em] text-slate-900 sm:text-[1.75rem]">Analitik</h1><p className="mt-1 text-xs text-slate-500 sm:text-sm">Görev ilerlemeni ve takım iş yükünü tek yerde incele.</p></div>
            {isLoadingTasks ? <AnalyticsSkeleton /> : <TaskAnalytics tasks={tasks} />}
        </div>
    );
}

function AnalyticsSkeleton() {
    return <div className="grid gap-3 lg:grid-cols-2"><div className="h-72 animate-pulse rounded-2xl bg-slate-200/70" /><div className="h-72 animate-pulse rounded-2xl bg-slate-200/70" /></div>;
}
