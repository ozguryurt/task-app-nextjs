import { NextRequest, NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/jwt-helpers';
import { enforceRateLimit } from '@/lib/rate-limit';
import { rejectOversizedRequest, isValidId } from '@/lib/security';
import { findMentionedMembers, notifyUser, recordTaskActivity } from '@/lib/task-collaboration';

interface TaskRow extends RowDataPacket {
    id: number;
    title: string;
    assigned_to: number;
    assigned_by: number;
}

interface MemberRow extends RowDataPacket {
    user_id: number;
    name: string;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ takimId: string; gorevId: string }> }
) {
    try {
        const rejectedBody = rejectOversizedRequest(request);
        if (rejectedBody) return rejectedBody;
        const { takimId, gorevId } = await params;
        if (!isValidId(takimId) || !isValidId(gorevId)) {
            return NextResponse.json({ error: 'Geçersiz görev adresi' }, { status: 400 });
        }

        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
        const auth = await verifyJWT(token);
        if (!auth.valid || !auth.payload) {
            return NextResponse.json({ error: auth.error || 'Geçersiz oturum' }, { status: 401 });
        }

        const teamId = Number(takimId);
        const taskId = Number(gorevId);
        const userId = auth.payload.userId;
        const limited = enforceRateLimit(request, { scope: 'task-comment', limit: 20, windowMs: 60_000, identifier: String(userId) });
        if (limited) return limited;

        const [members] = await pool.query<MemberRow[]>(
            `SELECT tm.user_id, u.name FROM team_members tm
             JOIN users u ON u.id = tm.user_id
             WHERE tm.team_id = ?`,
            [teamId]
        );
        if (!members.some((member) => member.user_id === userId)) {
            return NextResponse.json({ error: 'Bu takımın üyesi değilsiniz' }, { status: 403 });
        }

        const [tasks] = await pool.query<TaskRow[]>(
            'SELECT id, title, assigned_to, assigned_by FROM tasks WHERE id = ? AND team_id = ?',
            [taskId, teamId]
        );
        if (!tasks.length) return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });

        const rawBody: unknown = await request.json();
        const payload = typeof rawBody === 'object' && rawBody !== null
            ? rawBody as { body?: unknown; mentionIds?: unknown }
            : {};
        const body = payload.body;
        if (typeof body !== 'string' || !body.trim() || body.trim().length > 2000) {
            return NextResponse.json({ error: 'Yorum 1–2000 karakter olmalıdır' }, { status: 400 });
        }
        const content = body.trim();
        const matchedIds = new Set(findMentionedMembers(content, members));
        const selectedIds = payload.mentionIds ?? [];
        if (!Array.isArray(selectedIds) || selectedIds.length > 20 || selectedIds.some((id) => !Number.isSafeInteger(id) || !matchedIds.has(id))) {
            return NextResponse.json({ error: 'Geçersiz bahsetme seçimi' }, { status: 400 });
        }
        const nameCounts = new Map<string, number>();
        for (const member of members) {
            const name = member.name.toLocaleLowerCase('tr-TR');
            nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);
        }
        const mentionedIds = new Set<number>(selectedIds);
        for (const member of members) {
            if (matchedIds.has(member.user_id) && nameCounts.get(member.name.toLocaleLowerCase('tr-TR')) === 1) {
                mentionedIds.add(member.user_id);
            }
        }
        const task = tasks[0];
        const connection = await pool.getConnection();
        let commentId: number;
        try {
            await connection.beginTransaction();
            const [result] = await connection.query<ResultSetHeader>(
                'INSERT INTO task_comments (task_id, author_id, body) VALUES (?, ?, ?)',
                [taskId, userId, content]
            );
            commentId = result.insertId;
            for (const mentionedId of mentionedIds) {
                await connection.query('INSERT INTO task_comment_mentions (comment_id, user_id) VALUES (?, ?)', [commentId, mentionedId]);
            }
            await recordTaskActivity(connection, taskId, userId, 'commented', 'comment_id', null, commentId);
            for (const mentionedId of mentionedIds) {
                await notifyUser(connection, mentionedId, userId, teamId, taskId, 'mention', `"${task.title}" görevindeki yorumda sizden bahsedildi`);
            }
            const participants = new Set([task.assigned_to, task.assigned_by]);
            for (const participantId of participants) {
                if (!mentionedIds.has(participantId)) {
                    await notifyUser(connection, participantId, userId, teamId, taskId, 'comment', `"${task.title}" görevine yeni yorum eklendi`);
                }
            }
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        const [comments] = await pool.query<RowDataPacket[]>(
            `SELECT c.id, c.task_id, c.author_id, c.body, c.created_at,
                    u.name AS author_name, u.avatar_url AS author_avatar_url
             FROM task_comments c LEFT JOIN users u ON u.id = c.author_id WHERE c.id = ?`,
            [commentId]
        );
        return NextResponse.json({ success: true, comment: comments[0] }, { status: 201 });
    } catch (error) {
        console.error('Yorum eklenirken hata:', error);
        return NextResponse.json({ error: 'Yorum eklenemedi' }, { status: 500 });
    }
}
