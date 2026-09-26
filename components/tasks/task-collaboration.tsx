'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Clock3, AtSign, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/users/user-avatar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { TeamMember, TaskProject, TaskLabel } from '@/lib/store/team-store';
import { TASKS_CHANGED_EVENT } from '@/lib/task-events';

interface TaskComment {
    id: number;
    author_id: number | null;
    author_name: string | null;
    author_avatar_url: string | null;
    body: string;
    created_at: string;
}

interface TaskActivity {
    id: number;
    actor_name: string | null;
    event_type: 'created' | 'updated' | 'commented' | 'comment_deleted';
    field_name: string | null;
    old_value: string | null;
    new_value: string | null;
    created_at: string;
}

const fieldLabels: Record<string, string> = {
    project_id: 'Proje', assigned_to: 'Atanan kişi', title: 'Başlık', description: 'Açıklama',
    status: 'Durum', priority: 'Öncelik', start_date: 'Başlangıç', end_date: 'Bitiş',
    due_date: 'Teslim tarihi', label_ids: 'Etiketler',
};
const statusLabels: Record<string, string> = {
    pending: 'Beklemede', in_progress: 'Devam ediyor', completed: 'Tamamlandı', cancelled: 'İptal edildi',
};
const priorityLabels: Record<string, string> = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };

function formatDate(value: string) {
    return new Date(value).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatValue(field: string | null, value: string | null, members: TeamMember[], projects: TaskProject[], labels: TaskLabel[]) {
    if (value === null || value === '') return 'Boş';
    if (field === 'status') return statusLabels[value] ?? value;
    if (field === 'priority') return priorityLabels[value] ?? value;
    if (field === 'assigned_to') return members.find((member) => member.user_id === Number(value))?.name ?? `Kullanıcı #${value}`;
    if (field === 'project_id') return projects.find((project) => project.id === Number(value))?.name ?? `Proje #${value}`;
    if (field === 'label_ids') return value.split(',').map((id) => labels.find((label) => label.id === Number(id))?.name ?? `#${id}`).join(', ');
    if (field === 'start_date' || field === 'end_date' || field === 'due_date') {
        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('tr-TR', { dateStyle: 'long' });
    }
    return value;
}

export function TaskCollaboration({ teamId, taskId, members, projects, labels, isAdmin }: {
    teamId: number;
    taskId: number;
    members: TeamMember[];
    projects: TaskProject[];
    labels: TaskLabel[];
    isAdmin: boolean;
}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [activity, setActivity] = useState<TaskActivity[]>([]);
    const [body, setBody] = useState('');
    const [mentionIds, setMentionIds] = useState<number[]>([]);
    const [caret, setCaret] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
    const [isDeletingComment, setIsDeletingComment] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            const response = await fetch(`/api/takimlar/${teamId}/gorevler/${taskId}`, { credentials: 'include', cache: 'no-store' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Görev hareketleri yüklenemedi');
            setComments(result.comments ?? []);
            setActivity(result.activity ?? []);
            setError(null);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Görev hareketleri yüklenemedi');
        } finally {
            setLoading(false);
        }
    }, [teamId, taskId]);

    useEffect(() => {
        const initial = window.setTimeout(() => void refresh(), 0);
        const onTaskChanged = () => void refresh();
        const interval = window.setInterval(() => {
            if (document.visibilityState === 'visible') void refresh();
        }, 60_000);
        window.addEventListener(TASKS_CHANGED_EVENT, onTaskChanged);
        return () => { window.clearTimeout(initial); window.clearInterval(interval); window.removeEventListener(TASKS_CHANGED_EVENT, onTaskChanged); };
    }, [refresh]);

    const mentionMatch = body.slice(0, caret).match(/(?:^|\s)@([^@\n]{0,40})$/u);
    const mentionQuery = mentionMatch?.[1].toLocaleLowerCase('tr-TR') ?? null;
    const suggestions = mentionQuery === null ? [] : members
        .filter((member) => member.name.toLocaleLowerCase('tr-TR').includes(mentionQuery))
        .slice(0, 5);

    const insertMention = (member: TeamMember) => {
        const beforeCaret = body.slice(0, caret);
        const atIndex = beforeCaret.lastIndexOf('@');
        const next = `${body.slice(0, atIndex)}@${member.name} ${body.slice(caret)}`;
        setBody(next);
        setMentionIds((current) => [...new Set([...current, member.user_id])]);
        const nextCaret = atIndex + member.name.length + 2;
        setCaret(nextCaret);
        window.requestAnimationFrame(() => { textareaRef.current?.focus(); textareaRef.current?.setSelectionRange(nextCaret, nextCaret); });
    };

    const submitComment = async (event: React.FormEvent) => {
        event.preventDefault();
        const content = body.trim();
        if (!content || submitting) return;
        const activeMentionIds = mentionIds.filter((id) => {
            const member = members.find((item) => item.user_id === id);
            return member && content.includes(`@${member.name}`);
        });
        setSubmitting(true);
        try {
            const response = await fetch(`/api/takimlar/${teamId}/gorevler/${taskId}/yorumlar`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', body: JSON.stringify({ body: content, mentionIds: activeMentionIds }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Yorum eklenemedi');
            setBody('');
            setMentionIds([]);
            setCaret(0);
            await refresh();
        } catch (submitError) {
            toast.error(submitError instanceof Error ? submitError.message : 'Yorum eklenemedi');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteComment = async () => {
        if (deletingCommentId === null || isDeletingComment) return;
        setIsDeletingComment(true);
        try {
            const response = await fetch(`/api/takimlar/${teamId}/gorevler/${taskId}/yorumlar/${deletingCommentId}`, {
                method: 'DELETE', credentials: 'include',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Yorum silinemedi');
            setDeletingCommentId(null);
            await refresh();
            toast.success('Yorum silindi');
        } catch (deleteError) {
            toast.error(deleteError instanceof Error ? deleteError.message : 'Yorum silinemedi');
        } finally {
            setIsDeletingComment(false);
        }
    };

    return (
        <>
            <Card className="overflow-hidden rounded-2xl border-border bg-card py-0">
                <CardHeader className="border-b border-border px-4 py-4 sm:px-5">
                    <CardTitle className="flex items-center gap-2 text-sm"><MessageCircle className="size-4 text-primary" /> Yorumlar <span className="text-xs font-normal text-muted-foreground">{comments.length}</span></CardTitle>
                    <CardDescription className="text-xs">Takım arkadaşlarınla görev üzerinde konuş</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 py-4">
                    {loading ? <div className="space-y-3"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-4/5" /></div>
                        : error ? <p className="text-xs text-destructive">{error}</p>
                        : comments.length === 0 ? <p className="rounded-lg border border-dashed border-border bg-muted/25 p-4 text-center text-xs text-muted-foreground">Henüz yorum yok. İlk notu sen ekle.</p>
                        : <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">{comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2.5">
                                <UserAvatar name={comment.author_name} src={comment.author_avatar_url} className="size-8" />
                                <div className="min-w-0 flex-1 rounded-xl bg-muted/50 px-3 py-2.5">
                                    <div className="flex flex-wrap items-center justify-between gap-1"><span className="text-xs font-semibold">{comment.author_name ?? 'Eski üye'}</span><div className="flex items-center gap-1"><time className="text-[10px] text-muted-foreground">{formatDate(comment.created_at)}</time>{isAdmin && <Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" aria-label={`${comment.author_name ?? 'Eski üye'} kullanıcısının yorumunu sil`} disabled={isDeletingComment} onClick={() => setDeletingCommentId(comment.id)}><Trash2 className="size-3.5" /></Button>}</div></div>
                                    <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5">{comment.body}</p>
                                </div>
                            </div>
                        ))}</div>}
                    <form onSubmit={submitComment} className="space-y-2 border-t border-border/70 pt-4">
                        <div className="relative">
                            <Textarea ref={textareaRef} value={body} maxLength={2000} rows={3} placeholder="Yorum yaz... @ ile takım üyesinden bahset"
                                aria-label="Görev yorumu" onChange={(event) => { setBody(event.target.value); setCaret(event.target.selectionStart); }}
                                onClick={(event) => setCaret(event.currentTarget.selectionStart)} onKeyUp={(event) => setCaret(event.currentTarget.selectionStart)} />
                            {suggestions.length > 0 && <div className="absolute bottom-full left-0 z-20 mb-1 w-full overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg" role="listbox" aria-label="Bahsedilecek takım üyesi">
                                {suggestions.map((member) => <button key={member.user_id} type="button" onClick={() => insertMention(member)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted" role="option" aria-selected={false}><AtSign className="size-3.5 text-primary" /><span>{member.name}</span><span className="ml-auto truncate text-[10px] text-muted-foreground">{member.email}</span></button>)}
                            </div>}
                        </div>
                        <div className="flex items-center justify-between gap-2"><span className="text-[10px] text-muted-foreground">@ ile bahsettiğin takım üyesine bildirim gider.</span><Button type="submit" size="sm" disabled={!body.trim() || submitting}><Send className="size-3.5" /> Gönder</Button></div>
                    </form>
                </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-2xl border-border bg-card py-0">
                <CardHeader className="border-b border-border px-4 py-4 sm:px-5"><CardTitle className="flex items-center gap-2 text-sm"><Clock3 className="size-4 text-primary" /> Değişiklik geçmişi</CardTitle><CardDescription className="text-xs">Kim, hangi alanı ne zaman değiştirdi</CardDescription></CardHeader>
                <CardContent className="space-y-3 py-4">
                    {loading ? <Skeleton className="h-20 w-full" /> : activity.length === 0 ? <p className="text-xs text-muted-foreground">Bu görev için henüz kayıtlı hareket yok. Geçmiş, özellik etkinleştirildikten sonraki değişiklikleri gösterir.</p> : activity.map((item) => (
                        <div key={item.id} className="flex gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><Clock3 className="size-3.5" /></span>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium"><span className="font-semibold">{item.actor_name ?? 'Eski üye'}</span> {item.event_type === 'created' ? 'görevi oluşturdu' : item.event_type === 'commented' ? 'yorum ekledi' : item.event_type === 'comment_deleted' ? `#${item.old_value} numaralı yorumu sildi` : `${fieldLabels[item.field_name ?? ''] ?? item.field_name} alanını değiştirdi`}</p>
                                {item.event_type === 'updated' && <div className="mt-1 break-words text-[11px] text-muted-foreground"><span className="line-through">{formatValue(item.field_name, item.old_value, members, projects, labels)}</span><span className="mx-1.5">→</span><span className="font-medium text-foreground">{formatValue(item.field_name, item.new_value, members, projects, labels)}</span></div>}
                                <time className="mt-1 block text-[10px] text-muted-foreground">{formatDate(item.created_at)}</time>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <ConfirmDialog
                open={deletingCommentId !== null}
                onOpenChange={(open) => { if (!open && !isDeletingComment) setDeletingCommentId(null); }}
                onConfirm={() => void deleteComment()}
                title="Yorumu sil"
                description="Bu yorum kalıcı olarak silinecek. Silme işlemi değişiklik geçmişinde görünecek."
                confirmText="Yorumu sil"
                isDestructive
                isLoading={isDeletingComment}
            />
        </>
    );
}
