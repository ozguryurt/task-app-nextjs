'use client';

import { useState } from 'react';
import { Pencil, Plus, Save, Tags, Trash2, WandSparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { COLOR_SWATCHES, ColorSwatches } from '@/components/ui/color-swatches';
import type { MetadataType } from '@/lib/hooks/use-task-metadata';
import type { TaskLabel, TaskProject, TaskTemplate } from '@/lib/store/team-store';

export function TaskMetadataManager({
    open, onOpenChange, projects, labels, templates, isSubmitting, onCreate, onUpdate, onDelete,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projects: TaskProject[];
    labels: TaskLabel[];
    templates: TaskTemplate[];
    isSubmitting: boolean;
    onCreate: (payload: Record<string, unknown> & { type: MetadataType }) => Promise<boolean>;
    onUpdate: (payload: Record<string, unknown> & { type: MetadataType; id: number }) => Promise<boolean>;
    onDelete: (type: MetadataType, id: number) => Promise<boolean>;
}) {
    const [section, setSection] = useState<MetadataType>('label');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(COLOR_SWATCHES[0]);
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [projectId, setProjectId] = useState('none');
    const [editingId, setEditingId] = useState<number | null>(null);

    const reset = () => { setName(''); setDescription(''); setColor(COLOR_SWATCHES[0]); setTitle(''); setPriority('medium'); setProjectId('none'); setEditingId(null); };
    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        const payload = section === 'label'
            ? { type: section, name, color }
            : { type: section, name, title, description, priority, project_id: projectId === 'none' ? null : Number(projectId) };
        const success = editingId === null
            ? await onCreate(payload)
            : await onUpdate({ ...payload, id: editingId });
        if (success) reset();
    };

    const startEditing = (item: TaskLabel | TaskTemplate) => {
        setEditingId(item.id);
        setName(item.name);
        if (section === 'label') {
            const label = item as TaskLabel;
            setColor(label.color);
            setDescription('');
        } else {
            const template = item as TaskTemplate;
            setTitle(template.title);
            setDescription(template.description ?? '');
            setPriority(template.priority);
            setProjectId(template.project_id ? String(template.project_id) : 'none');
        }
    };

    const items = section === 'label' ? labels : templates;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader><DialogTitle>Görev kaynakları</DialogTitle><DialogDescription>Etiketleri ve tekrar kullanılabilir görev şablonlarını yönetin.</DialogDescription></DialogHeader>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                    {([
                        ['label', 'Etiketler', Tags], ['template', 'Şablonlar', WandSparkles],
                    ] as const).map(([value, label, Icon]) => (
                        <Button key={value} type="button" size="sm" variant={section === value ? 'outline' : 'ghost'} className={section === value ? 'bg-card' : ''} onClick={() => { setSection(value); reset(); }}><Icon /><span className="hidden sm:inline">{label}</span></Button>
                    ))}
                </div>

                <form onSubmit={submit} className="space-y-3 rounded-xl border p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5"><Label htmlFor="metadata-name">{section === 'template' ? 'Şablon adı' : 'Ad'}</Label><Input id="metadata-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required /></div>
                        {section === 'label' && <div className="space-y-1.5"><Label>Renk</Label><ColorSwatches value={color} onChange={setColor} label="Etiket rengi" /></div>}
                    </div>
                    {section === 'template' && <div className="space-y-1.5"><Label htmlFor="template-title">Görev başlığı</Label><Input id="template-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} required /></div>}
                    {section === 'template' && <div className="space-y-1.5"><Label htmlFor="metadata-description">Açıklama</Label><Textarea id="metadata-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>}
                    {section === 'template' && <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label>Öncelik</Label><Select value={priority} onValueChange={(value) => setPriority(value as typeof priority)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Düşük</SelectItem><SelectItem value="medium">Orta</SelectItem><SelectItem value="high">Yüksek</SelectItem></SelectContent></Select></div><div className="space-y-1.5"><Label>Proje</Label><Select value={projectId} onValueChange={setProjectId}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Projesiz</SelectItem>{projects.map((project) => <SelectItem key={project.id} value={String(project.id)}>{project.name}</SelectItem>)}</SelectContent></Select></div></div>}
                    <div className="flex items-center gap-2">
                        <Button type="submit" size="sm" disabled={isSubmitting || !name.trim() || (section === 'template' && !title.trim())}>{editingId === null ? <><Plus /> Oluştur</> : <><Save /> Değişiklikleri kaydet</>}</Button>
                        {editingId !== null && <Button type="button" variant="ghost" size="sm" onClick={reset}><X /> Düzenlemeyi iptal et</Button>}
                    </div>
                </form>

                <div className="max-h-56 space-y-1 overflow-y-auto">
                    {items.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">Henüz kayıt yok.</p> : items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 hover:bg-muted/60">
                            <div className="flex min-w-0 items-center gap-2">{'color' in item && <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />}<div className="min-w-0"><p className="truncate text-sm font-medium">{item.name}</p>{'title' in item && <p className="truncate text-xs text-muted-foreground">{item.title}</p>}</div></div>
                            <div className="flex shrink-0 items-center gap-1">
                                <Button type="button" variant="ghost" size="icon-sm" disabled={isSubmitting} onClick={() => startEditing(item as TaskLabel | TaskTemplate)} aria-label={`${item.name} kaydını düzenle`}><Pencil /></Button>
                                <Button type="button" variant="ghost" size="icon-sm" disabled={isSubmitting} onClick={() => void onDelete(section, item.id)} aria-label={`${item.name} kaydını sil`} className="text-muted-foreground hover:text-destructive"><Trash2 /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
