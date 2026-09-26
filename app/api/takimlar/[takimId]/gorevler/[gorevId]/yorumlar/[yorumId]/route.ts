import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/jwt-helpers';
import { isValidId } from '@/lib/security';
import { recordTaskActivity } from '@/lib/task-collaboration';

interface CommentRow extends RowDataPacket {
    id: number;
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ takimId: string; gorevId: string; yorumId: string }> }
) {
    try {
        const { takimId, gorevId, yorumId } = await params;
        if (!isValidId(takimId) || !isValidId(gorevId) || !isValidId(yorumId)) {
            return NextResponse.json({ error: 'Geçersiz yorum adresi' }, { status: 400 });
        }

        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
        const auth = await verifyJWT(token);
        if (!auth.valid || !auth.payload) {
            return NextResponse.json({ error: auth.error || 'Geçersiz oturum' }, { status: 401 });
        }

        const teamId = Number(takimId);
        const taskId = Number(gorevId);
        const commentId = Number(yorumId);
        if (![teamId, taskId, commentId].every(Number.isSafeInteger)) {
            return NextResponse.json({ error: 'Geçersiz yorum adresi' }, { status: 400 });
        }
        const userId = auth.payload.userId;
        const [managers] = await pool.query<RowDataPacket[]>(
            `SELECT tm.user_id FROM team_members tm
             WHERE tm.team_id = ? AND tm.user_id = ? AND tm.role = 'admin'`,
            [teamId, userId]
        );
        if (!managers.length) {
            return NextResponse.json({ error: 'Yorum silmek için yönetici yetkisi gereklidir' }, { status: 403 });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [comments] = await connection.query<CommentRow[]>(
                `SELECT c.id FROM task_comments c
                 JOIN tasks t ON t.id = c.task_id
                 WHERE c.id = ? AND c.task_id = ? AND t.team_id = ? FOR UPDATE`,
                [commentId, taskId, teamId]
            );
            if (!comments.length) {
                await connection.rollback();
                return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 });
            }

            await connection.query('DELETE FROM task_comments WHERE id = ? AND task_id = ?', [commentId, taskId]);
            // Silme kaydına yorum metnini tekrar ekleme; yalnızca yorum numarası kalır.
            await recordTaskActivity(connection, taskId, userId, 'comment_deleted', 'comment_id', commentId);
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Yorum silinirken hata:', error);
        return NextResponse.json({ error: 'Yorum silinemedi' }, { status: 500 });
    }
}
