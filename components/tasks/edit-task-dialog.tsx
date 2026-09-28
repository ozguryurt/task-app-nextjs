'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TeamMember, Task, type TaskLabel, type TaskProject, type ProjectMilestone } from '@/lib/store/team-store';

interface EditTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: {
        assignee_ids?: number[];
        title?: string;
        description?: string;
        status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
        priority?: 'low' | 'medium' | 'high';
        start_date?: string | null;
        end_date?: string | null;
        due_date?: string | null;
        project_id?: number | null;
        milestone_id?: number | null;
        label_ids?: number[];
    }) => Promise<boolean>;
    task: Task | null;
    members: TeamMember[];
    projects?: TaskProject[];
    milestones?: ProjectMilestone[];
    labels?: TaskLabel[];
    isSubmitting?: boolean;
}

export function EditTaskDialog({
    open,
    onOpenChange,
    onSubmit,
    task,
    members,
    projects = [],
    milestones = [],
    labels = [],
    isSubmitting = false,
}: EditTaskDialogProps) {
    const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'cancelled'>('pending');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [projectId, setProjectId] = useState('none');
    const [milestoneId, setMilestoneId] = useState('none');
    const [labelIds, setLabelIds] = useState<number[]>([]);

    useEffect(() => {
        if (task) {
            setAssigneeIds(task.assignees?.map((assignee) => assignee.user_id) ?? [task.assigned_to]);
            setTitle(task.title);
            setDescription(task.description || '');
            setStatus(task.status);
            setPriority(task.priority);

            // Tarihleri YYYY-MM-DD formatına çevir
            setStartDate(task.start_date ? formatDateForInput(task.start_date) : '');
            setEndDate(task.end_date ? formatDateForInput(task.end_date) : '');
            setDueDate(task.due_date ? formatDateForInput(task.due_date) : '');
            setProjectId(task.project_id ? String(task.project_id) : 'none');
            setMilestoneId(task.milestone_id ? String(task.milestone_id) : 'none');
            setLabelIds(task.labels?.map((label) => label.id) ?? []);
        }
    }, [task]);

    // Tarihi YYYY-MM-DD formatına çevirme fonksiyonu
    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (assigneeIds.length === 0 || !title) {
            return;
        }

        const updateData: {
            assignee_ids?: number[];
            title?: string;
            description?: string;
            status?: Task['status'];
            priority?: Task['priority'];
            start_date?: string | null;
            end_date?: string | null;
            due_date?: string | null;
            project_id?: number | null;
            milestone_id?: number | null;
            label_ids?: number[];
        } = {};

        if (task) {
            const previousIds = (task.assignees?.map((assignee) => assignee.user_id) ?? [task.assigned_to]).sort((a, b) => a - b);
            const nextIds = [...assigneeIds].sort((a, b) => a - b);
            if (previousIds.join(',') !== nextIds.join(',')) updateData.assignee_ids = nextIds;
            if (title !== task.title) {
                updateData.title = title;
            }
            if (description !== (task.description || '')) {
                updateData.description = description;
            }
            if (status !== task.status) {
                updateData.status = status;
            }
            if (priority !== task.priority) {
                updateData.priority = priority;
            }
            if (startDate !== (task.start_date || '')) {
                updateData.start_date = startDate || null;
            }
            if (endDate !== (task.end_date || '')) {
                updateData.end_date = endDate || null;
            }
            if (dueDate !== (task.due_date || '')) {
                updateData.due_date = dueDate || null;
            }
            const currentProjectId = task.project_id ? String(task.project_id) : 'none';
            if (projectId !== currentProjectId) updateData.project_id = projectId === 'none' ? null : Number(projectId);
            const nextMilestoneId = projectId === 'none' ? 'none' : milestoneId;
            if (nextMilestoneId !== (task.milestone_id ? String(task.milestone_id) : 'none')) updateData.milestone_id = nextMilestoneId === 'none' ? null : Number(nextMilestoneId);
            const currentLabelIds = (task.labels ?? []).map((label) => label.id).sort((a, b) => a - b);
            const nextLabelIds = [...labelIds].sort((a, b) => a - b);
            if (currentLabelIds.join(',') !== nextLabelIds.join(',')) updateData.label_ids = nextLabelIds;
        }

        if (Object.keys(updateData).length === 0) {
            onOpenChange(false);
            return;
        }

        const success = await onSubmit(updateData);

        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Görevi Düzenle</DialogTitle>
                        <DialogDescription>
                            Görev bilgilerini güncelleyin.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-4">
                        <div className="space-y-2">
                            <Label>Atanan kişiler *</Label>
                            <div className="max-h-36 space-y-1 overflow-y-auto rounded-md border p-2">
                                {members.map((member) => (
                                    <label key={member.user_id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted">
                                        <Checkbox checked={assigneeIds.includes(member.user_id)} disabled={isSubmitting}
                                            onCheckedChange={(checked) => setAssigneeIds((current) => checked ? [...current, member.user_id] : current.filter((id) => id !== member.user_id))} />
                                        <span>{member.name} <span className="text-muted-foreground">({member.email})</span></span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Görev Başlığı *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Görev başlığını girin"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Açıklama</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Görev açıklamasını girin"
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="status">Durum</Label>
                                <Select
                                    value={status}
                                    onValueChange={(value) => setStatus(value as Task['status'])}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger id="status" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Beklemede</SelectItem>
                                        <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                                        <SelectItem value="completed">Tamamlandı</SelectItem>
                                        <SelectItem value="cancelled">İptal Edildi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Öncelik</Label>
                                <Select
                                    value={priority}
                                    onValueChange={(value) => setPriority(value as Task['priority'])}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger id="priority" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Düşük</SelectItem>
                                        <SelectItem value="medium">Orta</SelectItem>
                                        <SelectItem value="high">Yüksek</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {(projects.length > 0 || labels.length > 0) && (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {projects.length > 0 && <div className="space-y-2"><Label>Proje</Label><Select value={projectId} onValueChange={(value) => { setProjectId(value); setMilestoneId('none'); }} disabled={isSubmitting}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Projesiz</SelectItem>{projects.map((project) => <SelectItem key={project.id} value={String(project.id)}>{project.name}</SelectItem>)}</SelectContent></Select></div>}
                                {labels.length > 0 && <div className="space-y-2"><Label>Etiketler</Label><div className="flex min-h-9 flex-wrap items-center gap-2 rounded-md border px-2.5 py-1.5">{labels.map((label) => <label key={label.id} className="flex cursor-pointer items-center gap-1.5 text-xs"><Checkbox checked={labelIds.includes(label.id)} onCheckedChange={(checked) => setLabelIds((current) => checked ? [...current, label.id] : current.filter((id) => id !== label.id))} /><span className="size-2 rounded-full" style={{ backgroundColor: label.color }} />{label.name}</label>)}</div></div>}
                            </div>
                        )}

                        {projectId !== 'none' && milestones.some((item) => item.project_id === Number(projectId)) && <div className="space-y-2"><Label>Kilometre taşı</Label><Select value={milestoneId} onValueChange={setMilestoneId} disabled={isSubmitting}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Kilometre taşı yok</SelectItem>{milestones.filter((item) => item.project_id === Number(projectId)).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></div>}

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Başlangıç Tarihi</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="due_date">Bitiş Tarihi</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date">Son Tarih</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            İptal
                        </Button>
                        <Button type="submit" disabled={isSubmitting || assigneeIds.length === 0 || !title}>
                            {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
