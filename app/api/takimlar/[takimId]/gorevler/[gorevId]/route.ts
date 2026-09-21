import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { verifyJWT } from '@/lib/jwt-helpers';
import { updateTaskSchema } from '@/lib/validations/task-schema';
import { rejectOversizedRequest } from '@/lib/security';
import { attachTaskLabels } from '@/lib/task-metadata-db';

interface TaskRow extends RowDataPacket {
    id: number;
    team_id: number;
    project_id: number | null;
    project_name: string | null;
    project_color: string | null;
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

// GET /api/takimlar/[takimId]/gorevler/[gorevId] - Tek bir görevi getir
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ takimId: string; gorevId: string }> }
) {
    try {
        const { takimId: teamId, gorevId: taskId } = await params;
        const teamIdNum = parseInt(teamId);
        const taskIdNum = parseInt(taskId);

        if (isNaN(teamIdNum) || isNaN(taskIdNum)) {
            return NextResponse.json(
                { error: 'Geçersiz ID' },
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

        // Görevi getir
        const [tasks] = await pool.query<TaskRow[]>(
            `SELECT 
                t.*,
                p.name as project_name,
                p.color as project_color,
                u1.name as assigned_to_name,
                u1.email as assigned_to_email,
                u2.name as assigned_by_name,
                u2.email as assigned_by_email
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.assigned_by = u2.id
            WHERE t.id = ? AND t.team_id = ?`,
            [taskIdNum, teamIdNum]
        );

        if (tasks.length === 0) {
            return NextResponse.json(
                { error: 'Görev bulunamadı' },
                { status: 404 }
            );
        }

        const [task] = await attachTaskLabels(tasks);
        return NextResponse.json({
            success: true,
            task,
        });
    } catch (error) {
        console.error('Görev getirilirken hata:', error);
        return NextResponse.json(
            { error: 'Görev getirilirken bir hata oluştu' },
            { status: 500 }
        );
    }
}

// PUT /api/takimlar/[takimId]/gorevler/[gorevId] - Görevi güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ takimId: string; gorevId: string }> }
) {
    try {
        const rejectedBody = rejectOversizedRequest(request);
        if (rejectedBody) return rejectedBody;

        const { takimId: teamId, gorevId: taskId } = await params;
        const teamIdNum = parseInt(teamId);
        const taskIdNum = parseInt(taskId);

        if (isNaN(teamIdNum) || isNaN(taskIdNum)) {
            return NextResponse.json(
                { error: 'Geçersiz ID' },
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

        // Görevin varlığını kontrol et
        const [existingTasks] = await pool.query<TaskRow[]>(
            'SELECT * FROM tasks WHERE id = ? AND team_id = ?',
            [taskIdNum, teamIdNum]
        );

        if (existingTasks.length === 0) {
            return NextResponse.json(
                { error: 'Görev bulunamadı' },
                { status: 404 }
            );
        }

        const existingTask = existingTasks[0];
        const isAdmin = memberRows[0].role === 'admin';
        const isTaskCreator = existingTask.assigned_by === userId;
        const isAssignedUser = existingTask.assigned_to === userId;

        // Düzenleme yetkisi kontrolü: Admin, görevi atayan kişi veya göreve atanan kişi
        if (!isAdmin && !isTaskCreator && !isAssignedUser) {
            return NextResponse.json(
                { error: 'Bu görevi düzenleme yetkiniz yok' },
                { status: 403 }
            );
        }

        const rawBody: unknown = await request.json();
        const parsedBody = updateTaskSchema.safeParse(rawBody);
        if (!parsedBody.success) {
            return NextResponse.json(
                { error: parsedBody.error.issues[0]?.message || 'Geçersiz görev verisi' },
                { status: 400 }
            );
        }

        const body = parsedBody.data;

        // Atanan kişi yalnızca kendi görevinin durumunu değiştirebilir.
        if (!isAdmin && !isTaskCreator) {
            const attemptedFields = Object.keys(body);
            if (attemptedFields.some((field) => field !== 'status')) {
                return NextResponse.json(
                    { error: 'Atanan kullanıcı yalnızca görev durumunu güncelleyebilir' },
                    { status: 403 }
                );
            }
        }

        const {
            project_id,
            label_ids,
            assigned_to,
            title,
            description,
            status,
            priority,
            start_date,
            end_date,
            due_date,
        } = body;

        if (project_id) {
            const [projects] = await pool.query<RowDataPacket[]>('SELECT id FROM projects WHERE id = ? AND team_id = ?', [project_id, teamIdNum]);
            if (projects.length === 0) return NextResponse.json({ error: 'Geçersiz proje' }, { status: 400 });
        }

        const uniqueLabelIds = label_ids ? [...new Set(label_ids)] : undefined;
        if (uniqueLabelIds && uniqueLabelIds.length > 0) {
            const placeholders = uniqueLabelIds.map(() => '?').join(',');
            const [labels] = await pool.query<RowDataPacket[]>(
                `SELECT id FROM task_labels WHERE team_id = ? AND id IN (${placeholders})`,
                [teamIdNum, ...uniqueLabelIds]
            );
            if (labels.length !== uniqueLabelIds.length) return NextResponse.json({ error: 'Geçersiz etiket seçimi' }, { status: 400 });
        }

        // Eğer assigned_to değiştiriliyorsa, yeni kişinin takım üyesi olup olmadığını kontrol et
        if (assigned_to && assigned_to !== existingTasks[0].assigned_to) {
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
        }

        // Güncelleme sorgusu oluştur
        const updateFields: string[] = [];
        const updateValues: Array<string | number | null> = [];

        if (project_id !== undefined) {
            updateFields.push('project_id = ?');
            updateValues.push(project_id);
        }

        if (assigned_to !== undefined) {
            updateFields.push('assigned_to = ?');
            updateValues.push(assigned_to);
        }
        if (title !== undefined) {
            updateFields.push('title = ?');
            updateValues.push(title.trim());
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(description?.trim() || null);
        }
        if (status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(status);

            // Eğer status 'completed' olarak değiştirildiyse, completed_at'i ayarla
            if (status === 'completed' && existingTasks[0].status !== 'completed') {
                updateFields.push('completed_at = NOW()');
            } else if (status !== 'completed' && existingTasks[0].status === 'completed') {
                updateFields.push('completed_at = NULL');
            }
        }
        if (priority !== undefined) {
            updateFields.push('priority = ?');
            updateValues.push(priority);
        }
        if (start_date !== undefined) {
            updateFields.push('start_date = ?');
            updateValues.push(start_date || null);
        }
        if (end_date !== undefined) {
            updateFields.push('end_date = ?');
            updateValues.push(end_date || null);
        }
        if (due_date !== undefined) {
            updateFields.push('due_date = ?');
            updateValues.push(due_date || null);
        }

        if (updateFields.length === 0 && label_ids === undefined) {
            return NextResponse.json(
                { error: 'Güncellenecek alan bulunamadı' },
                { status: 400 }
            );
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            if (updateFields.length > 0) {
                await connection.query(
                    `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ? AND team_id = ?`,
                    [...updateValues, taskIdNum, teamIdNum]
                );
            }
            if (uniqueLabelIds !== undefined) {
                await connection.query('DELETE FROM task_label_assignments WHERE task_id = ?', [taskIdNum]);
                if (uniqueLabelIds.length > 0) {
                    await connection.query(
                        `INSERT INTO task_label_assignments (task_id, label_id) VALUES ${uniqueLabelIds.map(() => '(?, ?)').join(',')}`,
                        uniqueLabelIds.flatMap((labelId) => [taskIdNum, labelId])
                    );
                }
            }
            await connection.commit();
        } catch (transactionError) {
            await connection.rollback();
            throw transactionError;
        } finally {
            connection.release();
        }

        // Güncellenmiş görevi getir
        const [tasks] = await pool.query<TaskRow[]>(
            `SELECT 
                t.*,
                p.name as project_name,
                p.color as project_color,
                u1.name as assigned_to_name,
                u1.email as assigned_to_email,
                u2.name as assigned_by_name,
                u2.email as assigned_by_email
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.assigned_by = u2.id
            WHERE t.id = ?`,
            [taskIdNum]
        );

        const [updatedTask] = await attachTaskLabels(tasks);
        return NextResponse.json({
            success: true,
            message: 'Görev başarıyla güncellendi',
            task: updatedTask,
        });
    } catch (error) {
        console.error('Görev güncellenirken hata:', error);
        return NextResponse.json(
            { error: 'Görev güncellenirken bir hata oluştu' },
            { status: 500 }
        );
    }
}

// DELETE /api/takimlar/[takimId]/gorevler/[gorevId] - Görevi sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ takimId: string; gorevId: string }> }
) {
    try {
        const { takimId: teamId, gorevId: taskId } = await params;
        const teamIdNum = parseInt(teamId);
        const taskIdNum = parseInt(taskId);

        if (isNaN(teamIdNum) || isNaN(taskIdNum)) {
            return NextResponse.json(
                { error: 'Geçersiz ID' },
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

        // Görevin varlığını kontrol et
        const [tasks] = await pool.query<TaskRow[]>(
            'SELECT * FROM tasks WHERE id = ? AND team_id = ?',
            [taskIdNum, teamIdNum]
        );

        if (tasks.length === 0) {
            return NextResponse.json(
                { error: 'Görev bulunamadı' },
                { status: 404 }
            );
        }

        const task = tasks[0];
        const isAdmin = memberRows[0].role === 'admin';
        const isTaskCreator = task.assigned_by === userId;

        // Silme yetkisi kontrolü: Admin veya görevi atayan kişi
        if (!isAdmin && !isTaskCreator) {
            return NextResponse.json(
                { error: 'Bu görevi silme yetkiniz yok' },
                { status: 403 }
            );
        }

        // Görevi sil
        await pool.query<ResultSetHeader>(
            'DELETE FROM tasks WHERE id = ? AND team_id = ?',
            [taskIdNum, teamIdNum]
        );

        return NextResponse.json({
            success: true,
            message: 'Görev başarıyla silindi',
        });
    } catch (error) {
        console.error('Görev silinirken hata:', error);
        return NextResponse.json(
            { error: 'Görev silinirken bir hata oluştu' },
            { status: 500 }
        );
    }
}
