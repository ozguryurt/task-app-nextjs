'use client';

import { useState } from 'react';
import { FolderKanban, Plus, Tags, Trash2, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { MetadataType } from '@/lib/hooks/use-task-metadata';
import type { TaskLabel, TaskProject, TaskTemplate } from '@/lib/store/team-store';

const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#64748b'];

export function TaskMetadataManager({
    open, onOpenChange, projects, labels, templates, isSubmitting, onCreate, onDelete,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projects: TaskProject[];
    labels: TaskLabel[];
    templates: TaskTemplate[];
    isSubmitting: boolean;
    onCreate: (payload: Record<string, unknown> & { type: MetadataType }) => Promise<boolean>;
    onDelete: (type: MetadataType, id: number) => Promise<boolean>;
}) {
    const [section, setSection] = useState<MetadataType>('project');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(colors[0]);
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [projectId, setProjectId] = useState('none');

    const reset = () => { setName(''); setDescription(''); setTitle(''); setPriority('medium'); setProjectId('none'); };
    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        const payload = section === 'project'
            ? { type: section, name, description, color }
            : section === 'label'
                ? { type: section, name, color }
                : { type: section, name, title, description, priority, project_id: projectId === 'none' ? null : Number(projectId) };
        if (await onCreate(payload)) reset();
    };

    const items = section === 'project' ? projects : section === 'label' ? labels : templates;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader><DialogTitle>Görev yapılandırması</DialogTitle><DialogDescription>Projeleri, etiketleri ve tekrar kullanılabilir görev şablonlarını yönetin.</DialogDescription></DialogHeader>
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                    {([
                        ['project', 'Projeler', FolderKanban], ['label', 'Etiketler', Tags], ['template', 'Şablonlar', WandSparkles],
                    ] as const).map(([value, label, Icon]) => (
                        <Button key={value} type="button" size="sm" variant={section === value ? 'outline' : 'ghost'} className={section === value ? 'bg-card' : ''} onClick={() => { setSection(value); reset(); }}><Icon /><span className="hidden sm:inline">{label}</span></Button>
                    ))}
                </div>

                <form onSubmit={submit} className="space-y-3 rounded-xl border p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5"><Label htmlFor="metadata-name">{section === 'template' ? 'Şablon adı' : 'Ad'}</Label><Input id="metadata-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required /></div>
                        {section !== 'template' && <div className="space-y-1.5"><Label>Renk</Label><div className="flex h-9 items-center gap-1.5">{colors.map((item) => <button key={item} type="button" aria-label={`${item} rengini seç`} onClick={() => setColor(item)} className={`size-6 rounded-full border-2 transition-transform hover:scale-110 ${color === item ? 'border-foreground scale-110' : 'border-card'}`} style={{ backgroundColor: item }} />)}</div></div>}
                    </div>
                    {section === 'template' && <div className="space-y-1.5"><Label htmlFor="template-title">Görev başlığı</Label><Input id="template-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} required /></div>}
                    {section !== 'label' && <div className="space-y-1.5"><Label htmlFor="metadata-description">Açıklama</Label><Textarea id="metadata-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>}
                    {section === 'template' && <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label>Öncelik</Label><Select value={priority} onValueChange={(value) => setPriority(value as typeof priority)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Düşük</SelectItem><SelectItem value="medium">Orta</SelectItem><SelectItem value="high">Yüksek</SelectItem></SelectContent></Select></div><div className="space-y-1.5"><Label>Proje</Label><Select value={projectId} onValueChange={setProjectId}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Projesiz</SelectItem>{projects.map((project) => <SelectItem key={project.id} value={String(project.id)}>{project.name}</SelectItem>)}</SelectContent></Select></div></div>}
                    <Button type="submit" size="sm" disabled={isSubmitting || !name.trim() || (section === 'template' && !title.trim())}><Plus /> Oluştur</Button>
                </form>

                <div className="max-h-56 space-y-1 overflow-y-auto">
                    {items.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">Henüz kayıt yok.</p> : items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 hover:bg-muted/60">
                            <div className="flex min-w-0 items-center gap-2">{'color' in item && <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />}<div className="min-w-0"><p className="truncate text-sm font-medium">{item.name}</p>{'title' in item && <p className="truncate text-xs text-muted-foreground">{item.title}</p>}</div></div>
                            <Button type="button" variant="ghost" size="icon-sm" disabled={isSubmitting} onClick={() => void onDelete(section, item.id)} aria-label={`${item.name} kaydını sil`} className="text-muted-foreground hover:text-destructive"><Trash2 /></Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
