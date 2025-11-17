import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { verifyJWT } from '@/lib/jwt-helpers';

interface UserTaskRow extends RowDataPacket {
    id: number;
    team_id: number;
    team_name: string;
    assigned_to: number;
    assigned_by: number;
    assigned_by_name: string;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    start_date: string | null;
    end_date: string | null;
    due_date: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

// GET /api/user/tasks - Kullanıcıya atanan tüm görevleri getir
export async function GET(request: NextRequest) {
    try {
        // Token kontrolü
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Oturum bulunamadı' },
                { status: 401 }
            );
        }

        const { valid, payload, error } = verifyJWT(token);
        if (!valid || !payload) {
            return NextResponse.json(
                { error: error || 'Geçersiz token' },
                { status: 401 }
            );
        }

        const userId = payload.userId;

        // Kullanıcıya atanan görevleri getir
        const [tasks] = await pool.query<UserTaskRow[]>(
            `SELECT 
                t.id,
                t.team_id,
                tm.name as team_name,
                t.assigned_to,
                t.assigned_by,
                u.name as assigned_by_name,
                t.title,
                t.description,
                t.status,
                t.priority,
                t.start_date,
                t.end_date,
                t.due_date,
                t.completed_at,
                t.created_at,
                t.updated_at
            FROM tasks t
            INNER JOIN teams tm ON t.team_id = tm.id
            INNER JOIN users u ON t.assigned_by = u.id
            WHERE t.assigned_to = ?
            ORDER BY 
                CASE t.status
                    WHEN 'in_progress' THEN 1
                    WHEN 'pending' THEN 2
                    WHEN 'completed' THEN 3
                    WHEN 'cancelled' THEN 4
                END,
                CASE t.priority
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                END,
                t.created_at DESC`,
            [userId]
        );

        return NextResponse.json({
            success: true,
            tasks,
        });
    } catch (error) {
        console.error('Kullanıcı görevleri getirilirken hata:', error);
        return NextResponse.json(
            { error: 'Görevler getirilirken bir hata oluştu' },
            { status: 500 }
        );
    }
}

