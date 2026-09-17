import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { verifyJWT } from '@/lib/jwt-helpers';
import { createTaskSchema } from '@/lib/validations/task-schema';
import { rejectOversizedRequest } from '@/lib/security';

interface TaskRow extends RowDataPacket {
    id: number;
    team_id: number;
    assigned_to: number;
    assigned_by: number;
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
    assigned_to_name: string;
    assigned_to_email: string;
    assigned_by_name: string;
    assigned_by_email: string;
}

interface TeamMemberRow extends RowDataPacket {
    user_id: number;
    role: string;
}

// GET /api/takimlar/[takimId]/gorevler - Takımın tüm görevlerini getir
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ takimId: string }> }
) {
    try {
        const { takimId: teamId } = await params;
        const teamIdNum = parseInt(teamId);

        if (isNaN(teamIdNum)) {
            return NextResponse.json(
                { error: 'Geçersiz takım ID' },
                { status: 400 }
            );
        }

        // Token kontrolü
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Oturum bulunamadı' },
                { status: 401 }
            );
        }

        const { valid, payload, error } = await verifyJWT(token);
        if (!valid || !payload) {
            return NextResponse.json(
                { error: error || 'Geçersiz token' },
                { status: 401 }
            );
        }

        const userId = payload.userId;

        // Kullanıcının bu takımın üyesi olup olmadığını kontrol et
        const [memberRows] = await pool.query<TeamMemberRow[]>(
            'SELECT user_id, role FROM team_members WHERE team_id = ? AND user_id = ?',
            [teamIdNum, userId]
        );

        if (memberRows.length === 0) {
            return NextResponse.json(
                { error: 'Bu takımın üyesi değilsiniz' },
                { status: 403 }
            );
        }

        // Görevleri getir
        const [tasks] = await pool.query<TaskRow[]>(
            `SELECT 
                t.*,
                u1.name as assigned_to_name,
                u1.email as assigned_to_email,
                u2.name as assigned_by_name,
                u2.email as assigned_by_email
            FROM tasks t
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.assigned_by = u2.id
            WHERE t.team_id = ?
            ORDER BY t.created_at DESC`,
            [teamIdNum]
        );

        return NextResponse.json({
            success: true,
            tasks,
            userRole: memberRows[0].role,
        });
    } catch (error) {
        console.error('Görevler getirilirken hata:', error);
        return NextResponse.json(
            { error: 'Görevler getirilirken bir hata oluştu' },
            { status: 500 }
        );
    }
}

// POST /api/takimlar/[takimId]/gorevler - Yeni görev oluştur
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ takimId: string }> }
) {
    try {
        const rejectedBody = rejectOversizedRequest(request);
        if (rejectedBody) return rejectedBody;

        const { takimId: teamId } = await params;
        const teamIdNum = parseInt(teamId);

        if (isNaN(teamIdNum)) {
            return NextResponse.json(
                { error: 'Geçersiz takım ID' },
                { status: 400 }
            );
        }

        // Token kontrolü
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Oturum bulunamadı' },
                { status: 401 }
            );
        }

        const { valid, payload, error } = await verifyJWT(token);
        if (!valid || !payload) {
            return NextResponse.json(
                { error: error || 'Geçersiz token' },
                { status: 401 }
            );
        }

        const userId = payload.userId;

        // Kullanıcının bu takımın üyesi olup olmadığını kontrol et
        const [memberRows] = await pool.query<TeamMemberRow[]>(
            'SELECT user_id, role FROM team_members WHERE team_id = ? AND user_id = ?',
            [teamIdNum, userId]
        );

        if (memberRows.length === 0) {
            return NextResponse.json(
                { error: 'Bu takımın üyesi değilsiniz' },
                { status: 403 }
            );
        }

        // Sadece admin'ler görev oluşturabilir
        const isAdmin = memberRows[0].role === 'admin';
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Görev oluşturmak için yönetici yetkisi gereklidir' },
                { status: 403 }
            );
        }

        const parsedBody = createTaskSchema.safeParse(await request.json());
        if (!parsedBody.success) {
            return NextResponse.json(
                { error: parsedBody.error.issues[0]?.message || 'Geçersiz görev verisi' },
                { status: 400 }
            );
        }

        const {
            assigned_to,
            title,
            description,
            status = 'pending',
            priority = 'medium',
            start_date,
            end_date,
            due_date,
        } = parsedBody.data;

        // Atanan kişinin takım üyesi olup olmadığını kontrol et
        const [assignedMemberRows] = await pool.query<TeamMemberRow[]>(
            'SELECT user_id FROM team_members WHERE team_id = ? AND user_id = ?',
            [teamIdNum, assigned_to]
        );

        if (assignedMemberRows.length === 0) {
            return NextResponse.json(
                { error: 'Atanan kişi bu takımın üyesi değil' },
                { status: 400 }
            );
        }

        // Görevi oluştur
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO tasks (
                team_id, assigned_to, assigned_by, title, description,
                status, priority, start_date, end_date, due_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                teamIdNum,
                assigned_to,
                userId,
                title,
                description?.trim() || null,
                status,
                priority,
                start_date || null,
                end_date || null,
                due_date || null,
            ]
        );

        // Oluşturulan görevi getir
        const [tasks] = await pool.query<TaskRow[]>(
            `SELECT 
                t.*,
                u1.name as assigned_to_name,
                u1.email as assigned_to_email,
                u2.name as assigned_by_name,
                u2.email as assigned_by_email
            FROM tasks t
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.assigned_by = u2.id
            WHERE t.id = ?`,
            [result.insertId]
        );

        return NextResponse.json(
            {
                success: true,
                message: 'Görev başarıyla oluşturuldu',
                task: tasks[0],
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Görev oluşturulurken hata:', error);
        return NextResponse.json(
            { error: 'Görev oluşturulurken bir hata oluştu' },
            { status: 500 }
        );
    }
}
