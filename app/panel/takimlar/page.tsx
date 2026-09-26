'use client';

import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { useDashboardData } from '@/components/dashboard/dashboard-shell';
import { TeamCard } from '@/components/teams/team-card';
import { CreateTeamDialog } from '@/components/teams/create-team-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WorkspacePageHeader } from '@/components/dashboard/workspace-page-header';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeamsPage() {
    const { teams, isLoadingTeams, refreshTeams } = useDashboardData();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <div className="mx-auto max-w-[1250px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <WorkspacePageHeader eyebrow="Çalışma alanı" title="Takımlar" description="Ekiplerini ve çalışma alanlarını buradan yönet." action={<Button size="sm" onClick={() => setIsCreateOpen(true)}><Plus className="size-3.5" /> Yeni takım</Button>} />

            <div className="mb-4 flex items-center justify-between"><p className="text-xs font-semibold text-slate-700">Tüm takımlar</p><span className="text-[10px] text-slate-500">{teams.length} çalışma alanı</span></div>
            {isLoadingTeams ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-36 rounded-2xl" />)}</div>
            ) : teams.length ? (
                <div className="motion-stagger grid gap-3 md:grid-cols-2 xl:grid-cols-3">{teams.map((team) => <TeamCard key={team.id} team={team} />)}</div>
            ) : (
                <Card className="rounded-2xl border-slate-200/80 bg-white shadow-[0_3px_14px_rgba(24,32,66,0.03)]"><CardContent className="flex flex-col items-center py-12 text-center"><span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Users className="size-5" /></span><p className="text-sm font-semibold text-slate-800">Henüz takım yok</p><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">İlk takımını oluştur, çalışma alanını hazırla ve ekip arkadaşlarını davet et.</p><Button size="sm" className="mt-4" onClick={() => setIsCreateOpen(true)}><Plus /> Takım oluştur</Button></CardContent></Card>
            )}
            <CreateTeamDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={refreshTeams} />
        </div>
    );
}
