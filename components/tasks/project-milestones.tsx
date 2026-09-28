'use client';

import { useState } from 'react';
import { Pencil, Plus, Target, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ProjectMilestone, Task } from '@/lib/store/team-store';

type MilestoneData = { name: string; description?: string; target_date?: string | null };

interface Props {
    projectId: number;
    milestones: ProjectMilestone[];
    tasks: Task[];
    isAdmin: boolean;
    isSubmitting: boolean;
    onCreate: (projectId: number, data: MilestoneData) => Promise<boolean>;
    onUpdate: (id: number, data: MilestoneData) => Promise<boolean>;
    onDelete: (id: number) => Promise<boolean>;
}

export function ProjectMilestones({ projectId, milestones, tasks, isAdmin, isSubmitting, onCreate, onUpdate, onDelete }: Props) {
    const [editing, setEditing] = useState<ProjectMilestone | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [toDelete, setToDelete] = useState<ProjectMilestone | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [targetDate, setTargetDate] = useState('');

    const openDialog = (milestone: ProjectMilestone | null) => {
        setEditing(milestone);
        setName(milestone?.name ?? '');
        setDescription(milestone?.description ?? '');
        setTargetDate(milestone?.target_date?.slice(0, 10) ?? '');
        setDialogOpen(true);
    };

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        const data = { name: name.trim(), description: description.trim(), target_date: targetDate || null };
        if (!data.name) return;
        const saved = editing ? await onUpdate(editing.id, data) : await onCreate(projectId, data);
        if (saved) setDialogOpen(false);
    };

    return (
        <div className="mt-3 border-t border-border/70 pt-3">
            <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground"><Target className="size-3.5" /> Kilometre taşları</span>
                {isAdmin && <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[11px]" onClick={() => openDialog(null)}><Plus className="size-3" /> Ekle</Button>}
            </div>
            {milestones.length === 0 ? <p className="text-[11px] text-muted-foreground">Henüz kilometre taşı yok.</p> : (
                <div className="space-y-2">
                    {milestones.map((milestone) => {
                        const scoped = tasks.filter((task) => task.project_id === projectId && task.milestone_id === milestone.id && task.status !== 'cancelled');
                        const completed = scoped.filter((task) => task.status === 'completed').length;
                        const percent = scoped.length ? Math.round(completed / scoped.length * 100) : 0;
                        return <div key={milestone.id} className="rounded-lg border border-border/80 bg-muted/30 p-2.5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0"><p className="truncate text-xs font-medium text-foreground">{milestone.name}</p>{milestone.description && <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{milestone.description}</p>}</div>
                                {isAdmin && <div className="flex shrink-0 gap-0.5"><Button variant="ghost" size="icon-sm" aria-label={`${milestone.name} kilometre taşını düzenle`} onClick={() => openDialog(milestone)}><Pencil className="size-3.5" /></Button><Button variant="ghost" size="icon-sm" aria-label={`${milestone.name} kilometre taşını sil`} onClick={() => setToDelete(milestone)}><Trash2 className="size-3.5" /></Button></div>}
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground"><span>{completed}/{scoped.length} görev · %{percent}</span>{milestone.target_date && <span>Hedef {new Date(`${milestone.target_date.slice(0, 10)}T00:00:00`).toLocaleDateString('tr-TR')}</span>}</div>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border" role="progressbar" aria-label={`${milestone.name} ilerlemesi`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} /></div>
                        </div>;
                    })}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent><form onSubmit={submit} className="space-y-5">
                    <DialogHeader><DialogTitle>{editing ? 'Kilometre taşını düzenle' : 'Kilometre taşı ekle'}</DialogTitle><DialogDescription>Bu projedeki görevleri bir teslim hedefi altında gruplayın.</DialogDescription></DialogHeader>
                    <div className="space-y-3"><div className="space-y-1.5"><Label htmlFor={`milestone-name-${projectId}`}>Ad</Label><Input id={`milestone-name-${projectId}`} value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required /></div><div className="space-y-1.5"><Label htmlFor={`milestone-description-${projectId}`}>Açıklama</Label><Textarea id={`milestone-description-${projectId}`} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={3} /></div><div className="space-y-1.5"><Label htmlFor={`milestone-date-${projectId}`}>Hedef tarih</Label><Input id={`milestone-date-${projectId}`} type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} /></div></div>
                    <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button><Button type="submit" disabled={isSubmitting || !name.trim()}>{editing ? 'Kaydet' : 'Ekle'}</Button></DialogFooter>
                </form></DialogContent>
            </Dialog>
            <ConfirmDialog open={!!toDelete} onOpenChange={(open) => { if (!open) setToDelete(null); }} onConfirm={async () => { if (toDelete && await onDelete(toDelete.id)) setToDelete(null); }} title="Kilometre taşını sil" description={`“${toDelete?.name ?? ''}” silinsin mi? Bağlı görevler kalır, kilometre taşı bağlantıları kaldırılır.`} confirmText="Sil" cancelText="Vazgeç" isDestructive isLoading={isSubmitting} />
        </div>
    );
}
