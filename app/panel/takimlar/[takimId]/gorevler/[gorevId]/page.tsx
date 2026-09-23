'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Loader2,
    Pencil,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';
import { useAuthStore } from '@/lib/store/auth-store';
import type { Task, TeamMember, TaskLabel, TaskProject } from '@/lib/store/team-store';
import type { UpdateTaskData } from '@/lib/hooks/use-tasks';
import { cn } from '@/lib/utils';

interface PageProps {
    params: Promise<{ takimId: string; gorevId: string }>;
}

const statusInfo: Record<Task['status'], { label: string; className: string }> = {
    pending: { label: 'Beklemede', className: 'bg-amber-50 text-amber-800' },
    in_progress: { label: 'Devam Ediyor', className: 'bg-indigo-50 text-indigo-800' },
    completed: { label: 'Tamamlandı', className: 'bg-emerald-50 text-emerald-800' },
    cancelled: { label: 'İptal Edildi', className: 'bg-slate-100 text-slate-600' },
};

const priorityInfo: Record<Task['priority'], { label: string; className: string }> = {
    low: { label: 'Düşük öncelik', className: 'bg-slate-100 text-slate-600' },
    medium: { label: 'Orta öncelik', className: 'bg-amber-50 text-amber-800' },
    high: { label: 'Yüksek öncelik', className: 'bg-rose-50 text-rose-800' },
};

function formatDate(value: string | null, withTime = false) {
    if (!value) return 'Belirtilmedi';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Belirtilmedi';
    return date.toLocaleString('tr-TR', withTime
        ? { dateStyle: 'medium', timeStyle: 'short' }
        : { dateStyle: 'long' });
}

export default function TaskDetailPage({ params }: PageProps) {
    const { takimId, gorevId } = use(params);
    const teamId = Number(takimId);
    const taskId = Number(gorevId);
    const router = useRouter();
    const { user } = useAuthStore();
    const [task, setTask] = useState<Task | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [projects, setProjects] = useState<TaskProject[]>([]);
    const [labels, setLabels] = useState<TaskLabel[]>([]);
    const [teamName, setTeamName] = useState('Takım');
    const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const loadTask = async () => {
            if (!Number.isInteger(teamId) || !Number.isInteger(taskId)) {
                setError('Geçersiz görev adresi');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const requestOptions = { credentials: 'include' as const, signal: controller.signal };
                const [taskResponse, teamResponse, membersResponse, metadataResponse] = await Promise.all([
                    fetch(`/api/takimlar/${teamId}/gorevler/${taskId}`, requestOptions),
                    fetch(`/api/takimlar/${teamId}`, requestOptions),
                    fetch(`/api/takimlar/${teamId}/uyeler`, requestOptions),
                    fetch(`/api/takimlar/${teamId}/gorev-yapilandirma`, requestOptions),
                ]);
                const [taskData, teamData, membersData, metadataData] = await Promise.all([
                    taskResponse.json(),
                    teamResponse.json(),
                    membersResponse.json(),
                    metadataResponse.json(),
                ]);

                if (!taskResponse.ok) throw new Error(taskData.error || 'Görev yüklenemedi');
                if (!teamResponse.ok) throw new Error(teamData.error || 'Takım yüklenemedi');
                if (!membersResponse.ok) throw new Error(membersData.error || 'Takım üyeleri yüklenemedi');
                if (!metadataResponse.ok) throw new Error(metadataData.error || 'Görev yapılandırması yüklenemedi');

                setTask(taskData.task);
                setTeamName(teamData.team.name);
                setUserRole(teamData.userRole);
                setMembers(membersData.members ?? []);
                setProjects(metadataData.projects ?? []);
                setLabels(metadataData.labels ?? []);
            } catch (loadError) {
                if (loadError instanceof DOMException && loadError.name === 'AbortError') return;
                setError(loadError instanceof Error ? loadError.message : 'Görev yüklenemedi');
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };

        void loadTask();
        return () => controller.abort();
    }, [teamId, taskId]);

    const updateTask = async (data: UpdateTaskData) => {
        if (!task) return false;
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/takimlar/${teamId}/gorevler/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Görev güncellenemedi');
            setTask(result.task);
            toast.success('Görev güncellendi', { description: result.task.title });
            return true;
        } catch (updateError) {
            toast.error(updateError instanceof Error ? updateError.message : 'Görev güncellenemedi');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteTask = async () => {
        if (!task) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/takimlar/${teamId}/gorevler/${task.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Görev silinemedi');
            toast.success('Görev silindi', { description: task.title });
            router.replace(`/panel/takimlar/${teamId}`);
        } catch (deleteError) {
            toast.error(deleteError instanceof Error ? deleteError.message : 'Görev silinemedi');
            setIsDeleteOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex min-h-[calc(100dvh-4.25rem)] items-center justify-center bg-[#f6f8fc] text-sm text-slate-500"><Loader2 className="mr-2 size-5 animate-spin text-indigo-600" /> Görev hazırlanıyor...</div>;
    }

    if (error || !task) {
        return (
            <div className="flex min-h-[calc(100dvh-4.25rem)] items-center justify-center bg-[#f6f8fc] px-5">
                <Card className="w-full max-w-md rounded-2xl border-slate-200/80 bg-white text-center shadow-[0_18px_50px_rgba(24,32,66,0.08)]">
                    <CardHeader><CardTitle>Görev açılamadı</CardTitle><CardDescription>{error || 'Görev bulunamadı'}</CardDescription></CardHeader>
                    <CardContent><Button variant="outline" onClick={() => router.replace(`/panel/takimlar/${teamId}`)}><ArrowLeft /> Takıma dön</Button></CardContent>
                </Card>
            </div>
        );
    }

    const isAdmin = userRole === 'admin';
    const isCreator = task.assigned_by === user?.id;
    const isAssigned = task.assigned_to === user?.id;
    const canEditAll = isAdmin || isCreator;
    const canChangeStatus = canEditAll || isAssigned;
    const canDelete = isAdmin || isCreator;

    return (
        <div className="min-h-[calc(100dvh-4.25rem)] bg-[#f6f8fc] text-slate-900">
            <div className="mx-auto max-w-[1250px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-500">Görev kaydı <span className="mx-1 text-slate-300">/</span> #{task.id}</p>
                    <div className="flex items-center gap-2">
                        {canEditAll && <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}><Pencil /> Düzenle</Button>}
                        {canDelete && <Button variant="destructive" size="sm" onClick={() => setIsDeleteOpen(true)}><Trash2 /> Sil</Button>}
                    </div>
                </div>

                <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="space-y-4">
                        <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                            <CardHeader className="border-b border-slate-100 px-4 py-5 sm:px-6">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <Badge className={cn('border-0', statusInfo[task.status].className)}>{statusInfo[task.status].label}</Badge>
                                    <Badge className={cn('border-0', priorityInfo[task.priority].className)}>{priorityInfo[task.priority].label}</Badge>
                                    {task.project_name && <Badge variant="outline" style={{ borderColor: task.project_color || undefined }}>{task.project_name}</Badge>}
                                    {task.labels?.map((label) => <Badge key={label.id} variant="outline" style={{ borderColor: label.color, color: label.color }}>{label.name}</Badge>)}
                                </div>
                                <CardTitle className="text-xl leading-tight tracking-[-0.035em] text-slate-900 sm:text-2xl">{task.title}</CardTitle>
                                <CardDescription className="text-xs">{teamName} takımındaki görev</CardDescription>
                            </CardHeader>
                            <CardContent className="py-5 sm:py-6">
                                <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Açıklama</h2>
                                {task.description
                                    ? <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{task.description}</p>
                                    : <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-400">Bu görev için açıklama eklenmemiş.</p>}
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                            <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5"><CardTitle className="text-sm text-slate-800">Tarih planı</CardTitle><CardDescription className="text-[10px]">Görevin planlanan ve gerçekleşen tarihleri</CardDescription></CardHeader>
                            <CardContent className="grid gap-3 py-4 sm:grid-cols-2 sm:py-5">
                                <DateItem label="Başlangıç" value={formatDate(task.start_date)} />
                                <DateItem label="Bitiş" value={formatDate(task.end_date)} />
                                <DateItem label="Teslim tarihi" value={formatDate(task.due_date)} emphasized />
                                <DateItem label="Tamamlanma" value={formatDate(task.completed_at, true)} />
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                            <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-5"><CardTitle className="text-sm text-slate-800">Zaman çizelgesi</CardTitle></CardHeader>
                            <CardContent className="space-y-4 py-4">
                                <TimelineItem title="Görev oluşturuldu" value={formatDate(task.created_at, true)} />
                                {task.updated_at !== task.created_at && <TimelineItem title="Son güncelleme" value={formatDate(task.updated_at, true)} />}
                                {task.completed_at && <TimelineItem title="Görev tamamlandı" value={formatDate(task.completed_at, true)} completed />}
                            </CardContent>
                        </Card>
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-20">
                        {canChangeStatus && (
                            <Card className="rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                                <CardHeader className="px-4 pt-4 sm:px-5"><CardTitle className="text-sm text-slate-800">Görev durumu</CardTitle><CardDescription className="text-[10px]">İlerlemeyi güncelleyin</CardDescription></CardHeader>
                                <CardContent className="py-4">
                                    <Select value={task.status} onValueChange={(status) => void updateTask({ status: status as Task['status'] })} disabled={isSubmitting}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(statusInfo).map(([status, info]) => <SelectItem key={status} value={status}>{info.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                            <CardHeader className="px-4 pt-4 sm:px-5"><CardTitle className="text-sm text-slate-800">Kişiler</CardTitle></CardHeader>
                            <CardContent className="space-y-4 py-4">
                                <PersonItem label="Atanan" name={task.assigned_to_name} email={task.assigned_to_email} />
                                <PersonItem label="Atayan" name={task.assigned_by_name} email={task.assigned_by_email} />
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-slate-200/80 bg-white py-0 shadow-[0_3px_14px_rgba(24,32,66,0.03)]">
                            <CardContent className="space-y-2 py-4 text-[10px] text-slate-500">
                                <div className="flex items-center justify-between gap-3"><span>Görev no</span><span className="font-mono text-foreground">#{task.id}</span></div>
                                <div className="flex items-center justify-between gap-3"><span>Oluşturulma</span><span className="text-right text-foreground">{formatDate(task.created_at, true)}</span></div>
                                <div className="flex items-center justify-between gap-3"><span>Güncellenme</span><span className="text-right text-foreground">{formatDate(task.updated_at, true)}</span></div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>

            <EditTaskDialog open={isEditOpen} onOpenChange={setIsEditOpen} onSubmit={updateTask} task={task} members={members} projects={projects} labels={labels} isSubmitting={isSubmitting} />
            <ConfirmDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={deleteTask} title="Görevi sil" description={`"${task.title}" görevini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`} confirmText="Evet, sil" isDestructive isLoading={isSubmitting} />
        </div>
    );
}

function DateItem({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
    return (
        <div className={cn('rounded-lg border bg-muted/25 p-3', emphasized && 'border-primary/20 bg-primary/[0.035]')}>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><CalendarDays className="size-3.5" />{label}</p>
            <p className="mt-1 text-sm font-medium">{value}</p>
        </div>
    );
}

function PersonItem({ label, name, email }: { label: string; name: string; email: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">{name.charAt(0).toLocaleUpperCase('tr-TR')}</span>
            <div className="min-w-0"><p className="text-[10px] text-muted-foreground">{label}</p><p className="truncate text-sm font-medium">{name}</p><p className="truncate text-[11px] text-muted-foreground">{email}</p></div>
        </div>
    );
}

function TimelineItem({ title, value, completed = false }: { title: string; value: string; completed?: boolean }) {
    return (
        <div className="flex gap-3">
            <span className={cn('mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary', completed && 'bg-emerald-50 text-emerald-600')}>
                {completed ? <CheckCircle2 className="size-3.5" /> : <Clock3 className="size-3.5" />}
            </span>
            <div><p className="text-sm font-medium">{title}</p><p className="mt-0.5 text-xs text-muted-foreground">{value}</p></div>
        </div>
    );
}
