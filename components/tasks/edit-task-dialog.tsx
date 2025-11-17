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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { TeamMember, Task } from '@/lib/store/team-store';

interface EditTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: {
        assigned_to?: number;
        title?: string;
        description?: string;
        status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
        priority?: 'low' | 'medium' | 'high';
        start_date?: string;
        end_date?: string;
        due_date?: string;
    }) => Promise<void>;
    task: Task | null;
    members: TeamMember[];
    isSubmitting?: boolean;
    error?: string | null;
}

export function EditTaskDialog({
    open,
    onOpenChange,
    onSubmit,
    task,
    members,
    isSubmitting = false,
    error = null,
}: EditTaskDialogProps) {
    const [assignedTo, setAssignedTo] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'cancelled'>('pending');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        if (task) {
            setAssignedTo(task.assigned_to.toString());
            setTitle(task.title);
            setDescription(task.description || '');
            setStatus(task.status);
            setPriority(task.priority);

            // Tarihleri YYYY-MM-DD formatına çevir
            setStartDate(task.start_date ? formatDateForInput(task.start_date) : '');
            setEndDate(task.end_date ? formatDateForInput(task.end_date) : '');
            setDueDate(task.due_date ? formatDateForInput(task.due_date) : '');
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

        if (!assignedTo || !title) {
            return;
        }

        const updateData: any = {};

        if (task) {
            if (parseInt(assignedTo) !== task.assigned_to) {
                updateData.assigned_to = parseInt(assignedTo);
            }
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
        }

        await onSubmit(updateData);

        if (!error) {
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

                    <div className="space-y-4 py-4">
                        {error && (
                            <Alert variant="destructive">
                                {error}
                            </Alert>
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

                        <div className="grid grid-cols-2 gap-4">
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

                        <div className="grid grid-cols-3 gap-4">
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
                        <Button type="submit" disabled={isSubmitting || !assignedTo || !title}>
                            {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

