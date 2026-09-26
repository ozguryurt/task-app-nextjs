import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/jwt-helpers';
import { rejectOversizedRequest } from '@/lib/security';

function istanbulDate(offsetDays = 0) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date());
    const year = Number(parts.find((part) => part.type === 'year')?.value);
    const month = Number(parts.find((part) => part.type === 'month')?.value);
    const day = Number(parts.find((part) => part.type === 'day')?.value);
    return new Date(Date.UTC(year, month - 1, day + offsetDays)).toISOString().slice(0, 10);
}

async function currentUser(request: NextRequest): Promise<number | null> {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    const auth = await verifyJWT(token);
    return auth.valid && auth.payload ? auth.payload.userId : null;
}

export async function GET(request: NextRequest) {
    try {
        const userId = await currentUser(request);
        if (!userId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
        const today = istanbulDate();
        const tomorrow = istanbulDate(1);

        // Tekilleştirme anahtarı her görev ve teslim tarihi için tek hatırlatma üretir.
        await pool.query(
            `INSERT INTO notifications (user_id, team_id, task_id, type, message, dedupe_key)
             SELECT t.assigned_to, t.team_id, t.id, 'due_soon',
                    CONCAT('"', LEFT(t.title, 180), '" görevinin teslim tarihi yaklaşıyor'),
                    CONCAT('due_soon:', t.id, ':', DATE_FORMAT(t.due_date, '%Y-%m-%d'))
             FROM tasks t
             JOIN team_members tm ON tm.team_id = t.team_id AND tm.user_id = t.assigned_to
             WHERE t.assigned_to = ? AND t.status IN ('pending', 'in_progress')
               AND t.due_date BETWEEN ? AND ?
             ON DUPLICATE KEY UPDATE read_at = read_at`,
            [userId, today, tomorrow]
        );
        await pool.query(
            `INSERT INTO notifications (user_id, team_id, task_id, type, message, dedupe_key)
             SELECT t.assigned_to, t.team_id, t.id, 'overdue',
                    CONCAT('"', LEFT(t.title, 180), '" görevinin teslim tarihi geçti'),
                    CONCAT('overdue:', t.id, ':', DATE_FORMAT(t.due_date, '%Y-%m-%d'))
             FROM tasks t
             JOIN team_members tm ON tm.team_id = t.team_id AND tm.user_id = t.assigned_to
             WHERE t.assigned_to = ? AND t.status IN ('pending', 'in_progress') AND t.due_date < ?
             ON DUPLICATE KEY UPDATE read_at = read_at`,
            [userId, today]
        );

        const [notifications] = await pool.query<RowDataPacket[]>(
            `SELECT n.id, n.team_id, n.task_id, n.type, n.message, n.read_at, n.created_at,
                    u.name AS actor_name
             FROM notifications n
             JOIN team_members tm ON tm.team_id = n.team_id AND tm.user_id = n.user_id
             LEFT JOIN users u ON u.id = n.actor_id
             WHERE n.user_id = ? ORDER BY n.id DESC LIMIT 50`,
            [userId]
        );
        const [counts] = await pool.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS unread_count FROM notifications n
             JOIN team_members tm ON tm.team_id = n.team_id AND tm.user_id = n.user_id
             WHERE n.user_id = ? AND n.read_at IS NULL`,
            [userId]
        );
        return NextResponse.json(
            { notifications, unreadCount: Number(counts[0]?.unread_count ?? 0) },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        console.error('Bildirimler yüklenirken hata:', error);
        return NextResponse.json({ error: 'Bildirimler yüklenemedi' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const rejectedBody = rejectOversizedRequest(request);
        if (rejectedBody) return rejectedBody;
        const userId = await currentUser(request);
        if (!userId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
        const body: unknown = await request.json();
        if (typeof body !== 'object' || body === null) {
            return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
        }
        const input = body as { id?: unknown; all?: unknown };
        if (input.all === true) {
            await pool.query('UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL', [userId]);
        } else if (typeof input.id === 'number' && Number.isSafeInteger(input.id) && input.id > 0) {
            await pool.query('UPDATE notifications SET read_at = COALESCE(read_at, NOW()) WHERE id = ? AND user_id = ?', [input.id, userId]);
        } else {
            return NextResponse.json({ error: 'Geçersiz bildirim' }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Bildirim güncellenirken hata:', error);
        return NextResponse.json({ error: 'Bildirim güncellenemedi' }, { status: 500 });
    }
}
