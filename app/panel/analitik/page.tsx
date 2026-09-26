'use client';

import { useDashboardData } from '@/components/dashboard/dashboard-shell';
import { TaskAnalytics } from '@/components/dashboard/task-analytics';
import { WorkspacePageHeader } from '@/components/dashboard/workspace-page-header';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsPage() {
    const { tasks, isLoadingTasks } = useDashboardData();

    return (
        <div className="mx-auto max-w-[1250px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <WorkspacePageHeader eyebrow="Çalışma alanı" title="Analitik" description="Görev ilerlemeni ve takım iş yükünü tek yerde incele." />
            {isLoadingTasks ? <AnalyticsSkeleton /> : <TaskAnalytics tasks={tasks} />}
        </div>
    );
}

function AnalyticsSkeleton() {
    return <div className="grid gap-3 lg:grid-cols-2"><Skeleton className="h-72 rounded-2xl" /><Skeleton className="h-72 rounded-2xl" /></div>;
}
