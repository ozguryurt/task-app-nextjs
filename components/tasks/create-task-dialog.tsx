'use client';

import { useState } from 'react';
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
import { TeamMember, type TaskLabel, type TaskProject, type TaskTemplate } from '@/lib/store/team-store';

interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: {
        assigned_to: number;
        title: string;
        description?: string;
        status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
        priority?: 'low' | 'medium' | 'high';
        start_date?: string;
        end_date?: string;
        due_date?: string;
        project_id?: number | null;
        label_ids?: number[];
    }) => Promise<boolean>;
    members: TeamMember[];
    projects?: TaskProject[];
    labels?: TaskLabel[];
    templates?: TaskTemplate[];
    isSubmitting?: boolean;
}

export function CreateTaskDialog({
    open,
    onOpenChange,
    onSubmit,
    members,
    projects = [],
    labels = [],
    templates = [],
    isSubmitting = false,
}: CreateTaskDialogProps) {
    const [assignedTo, setAssignedTo] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'cancelled'>('pending');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [projectId, setProjectId] = useState('none');
    const [labelIds, setLabelIds] = useState<number[]>([]);
    const [templateId, setTemplateId] = useState('none');

    const applyTemplate = (value: string) => {
        setTemplateId(value);
        if (value === 'none') return;
        const template = templates.find((item) => item.id === Number(value));
        if (!template) return;
        setTitle(template.title);
        setDescription(template.description || '');
        setPriority(template.priority);
        setProjectId(template.project_id ? String(template.project_id) : 'none');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!assignedTo || !title) {
            return;
        }

        const success = await onSubmit({
            assigned_to: parseInt(assignedTo),
            title,
            description: description || undefined,
            status,
            priority,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            due_date: dueDate || undefined,
            project_id: projectId === 'none' ? null : Number(projectId),
            label_ids: labelIds,
        });

        // Form başarılı olursa temizle
        if (success) {
            resetForm();
            onOpenChange(false);
        }
    };

    const resetForm = () => {
        setAssignedTo('');
        setTitle('');
        setDescription('');
        setStatus('pending');
        setPriority('medium');
        setStartDate('');
        setEndDate('');
        setDueDate('');
        setProjectId('none');
        setLabelIds([]);
        setTemplateId('none');
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && !isSubmitting) {
            resetForm();
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Yeni Görev Oluştur</DialogTitle>
                        <DialogDescription>
                            Takım üyelerine yeni bir görev atayın.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-4">
                        {templates.length > 0 && (
                            <div className="space-y-2">
                                <Label>Görev şablonu</Label>
                                <Select value={templateId} onValueChange={applyTemplate} disabled={isSubmitting}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="none">Şablon kullanma</SelectItem>{templates.map((template) => <SelectItem key={template.id} value={String(template.id)}>{template.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="assigned_to">Atanan Kişi *</Label>
                            <Select
                                value={assignedTo}
                                onValueChange={setAssignedTo}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="assigned_to" className="w-full">
                                    <SelectValue placeholder="Kişi seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map((member) => (
                                        <SelectItem key={member.user_id} value={member.user_id.toString()}>
                                            {member.name} ({member.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                    onValueChange={(value) => setStatus(value as any)}
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
                                    onValueChange={(value) => setPriority(value as any)}
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
                                {projects.length > 0 && <div className="space-y-2"><Label>Proje</Label><Select value={projectId} onValueChange={setProjectId} disabled={isSubmitting}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Projesiz</SelectItem>{projects.map((project) => <SelectItem key={project.id} value={String(project.id)}>{project.name}</SelectItem>)}</SelectContent></Select></div>}
                                {labels.length > 0 && <div className="space-y-2"><Label>Etiketler</Label><div className="flex min-h-9 flex-wrap items-center gap-2 rounded-md border px-2.5 py-1.5">{labels.map((label) => <label key={label.id} className="flex cursor-pointer items-center gap-1.5 text-xs"><Checkbox checked={labelIds.includes(label.id)} onCheckedChange={(checked) => setLabelIds((current) => checked ? [...current, label.id] : current.filter((id) => id !== label.id))} /><span className="size-2 rounded-full" style={{ backgroundColor: label.color }} />{label.name}</label>)}</div></div>}
                            </div>
                        )}

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
                            onClick={() => handleOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            İptal
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !assignedTo || !title}>
                            {isSubmitting ? 'Oluşturuluyor...' : 'Oluştur'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
