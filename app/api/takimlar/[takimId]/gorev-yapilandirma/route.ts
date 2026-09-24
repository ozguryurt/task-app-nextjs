import { NextRequest, NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/jwt-helpers';
import { rejectOversizedRequest } from '@/lib/security';

const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

async function getMembership(request: NextRequest, teamId: number) {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    const verification = await verifyJWT(token);
    if (!verification.valid || !verification.payload) return null;
    const [members] = await pool.query<RowDataPacket[]>(
        'SELECT role FROM team_members WHERE team_id = ? AND user_id = ? LIMIT 1',
        [teamId, verification.payload.userId]
    );
    if (members.length === 0) return null;
    return { userId: verification.payload.userId, role: members[0].role as 'admin' | 'member' };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ takimId: string }> }) {
    const teamId = Number((await params).takimId);
    if (!Number.isInteger(teamId)) return NextResponse.json({ error: 'Geçersiz takım' }, { status: 400 });
    const membership = await getMembership(request, teamId);
    if (!membership) return NextResponse.json({ error: 'Bu takıma erişim yetkiniz yok' }, { status: 403 });

    const [[projects], [labels], [templates]] = await Promise.all([
        pool.query<RowDataPacket[]>('SELECT id, team_id, name, description, color FROM projects WHERE team_id = ? ORDER BY name', [teamId]),
        pool.query<RowDataPacket[]>('SELECT id, team_id, name, color FROM task_labels WHERE team_id = ? ORDER BY name', [teamId]),
        pool.query<RowDataPacket[]>(
            `SELECT tt.id, tt.team_id, tt.project_id, tt.name, tt.title, tt.description, tt.priority,
                    p.name AS project_name
             FROM task_templates tt LEFT JOIN projects p ON p.id = tt.project_id
             WHERE tt.team_id = ? ORDER BY tt.name`,
            [teamId]
        ),
    ]);
    return NextResponse.json({ projects, labels, templates });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ takimId: string }> }) {
    const rejectedBody = rejectOversizedRequest(request);
    if (rejectedBody) return rejectedBody;
    const teamId = Number((await params).takimId);
    const membership = Number.isInteger(teamId) ? await getMembership(request, teamId) : null;
    const body = await request.json();
    const type = body.type;
    if (!membership || membership.role !== 'admin') return NextResponse.json({ error: 'Yönetici yetkisi gereklidir' }, { status: 403 });
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > 120) return NextResponse.json({ error: 'Geçerli bir ad gereklidir' }, { status: 400 });

    try {
        if (type === 'project') {
            const description = typeof body.description === 'string' ? body.description.trim() : '';
            const color = COLOR_PATTERN.test(body.color) ? body.color : '#6366f1';
            const [result] = await pool.query<ResultSetHeader>(
                'INSERT INTO projects (team_id, name, description, color, created_by) VALUES (?, ?, ?, ?, ?)',
                [teamId, name, description || null, color, membership.userId]
            );
            return NextResponse.json({ success: true, item: { id: result.insertId, team_id: teamId, name, description: description || null, color } }, { status: 201 });
        }
        if (type === 'label') {
            const color = COLOR_PATTERN.test(body.color) ? body.color : '#64748b';
            const [result] = await pool.query<ResultSetHeader>(
                'INSERT INTO task_labels (team_id, name, color) VALUES (?, ?, ?)',
                [teamId, name, color]
            );
            return NextResponse.json({ success: true, item: { id: result.insertId, team_id: teamId, name, color } }, { status: 201 });
        }
        if (type === 'template') {
            const title = typeof body.title === 'string' ? body.title.trim() : '';
            const description = typeof body.description === 'string' ? body.description.trim() : '';
            const priority = ['low', 'medium', 'high'].includes(body.priority) ? body.priority : 'medium';
            const projectId = Number.isInteger(body.project_id) ? body.project_id : null;
            if (!title || title.length > 255) return NextResponse.json({ error: 'Şablon görev başlığı gereklidir' }, { status: 400 });
            if (projectId) {
                const [project] = await pool.query<RowDataPacket[]>('SELECT id FROM projects WHERE id = ? AND team_id = ?', [projectId, teamId]);
                if (project.length === 0) return NextResponse.json({ error: 'Geçersiz proje' }, { status: 400 });
            }
            const [result] = await pool.query<ResultSetHeader>(
                `INSERT INTO task_templates (team_id, project_id, name, title, description, priority, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [teamId, projectId, name, title, description || null, priority, membership.userId]
            );
            return NextResponse.json({ success: true, item: { id: result.insertId, team_id: teamId, project_id: projectId, name, title, description: description || null, priority } }, { status: 201 });
        }
        return NextResponse.json({ error: 'Geçersiz yapılandırma türü' }, { status: 400 });
    } catch (error) {
        const duplicate = typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY';
        return NextResponse.json({ error: duplicate ? 'Bu ad zaten kullanılıyor' : 'Kayıt oluşturulamadı' }, { status: duplicate ? 409 : 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ takimId: string }> }) {
    const rejectedBody = rejectOversizedRequest(request);
    if (rejectedBody) return rejectedBody;
    const teamId = Number((await params).takimId);
    const membership = Number.isInteger(teamId) ? await getMembership(request, teamId) : null;
    if (!membership || membership.role !== 'admin') return NextResponse.json({ error: 'Yönetici yetkisi gereklidir' }, { status: 403 });

    const body = await request.json();
    const id = Number(body.id);
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!Number.isInteger(id) || id <= 0 || !name || name.length > 120) {
        return NextResponse.json({ error: 'Geçerli bir kayıt ve ad gereklidir' }, { status: 400 });
    }
    const table = body.type === 'project' ? 'projects' : body.type === 'label' ? 'task_labels' : body.type === 'template' ? 'task_templates' : null;
    if (!table) return NextResponse.json({ error: 'Geçersiz yapılandırma türü' }, { status: 400 });
    const [existing] = await pool.query<RowDataPacket[]>(`SELECT id FROM ${table} WHERE id = ? AND team_id = ?`, [id, teamId]);
    if (existing.length === 0) return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });

    try {
        if (body.type === 'project') {
            const description = typeof body.description === 'string' ? body.description.trim() : '';
            const color = COLOR_PATTERN.test(body.color) ? body.color : '#6366f1';
            await pool.query<ResultSetHeader>(
                'UPDATE projects SET name = ?, description = ?, color = ? WHERE id = ? AND team_id = ?',
                [name, description || null, color, id, teamId]
            );
        } else if (body.type === 'label') {
            const color = COLOR_PATTERN.test(body.color) ? body.color : '#64748b';
            await pool.query<ResultSetHeader>(
                'UPDATE task_labels SET name = ?, color = ? WHERE id = ? AND team_id = ?',
                [name, color, id, teamId]
            );
        } else if (body.type === 'template') {
            const title = typeof body.title === 'string' ? body.title.trim() : '';
            const description = typeof body.description === 'string' ? body.description.trim() : '';
            const priority = ['low', 'medium', 'high'].includes(body.priority) ? body.priority : 'medium';
            const projectId = body.project_id === null || body.project_id === 'none' ? null : Number(body.project_id);
            if (!title || title.length > 255 || (projectId !== null && (!Number.isInteger(projectId) || projectId <= 0))) {
                return NextResponse.json({ error: 'Geçerli bir görev başlığı ve proje seçin' }, { status: 400 });
            }
            if (projectId !== null) {
                const [project] = await pool.query<RowDataPacket[]>('SELECT id FROM projects WHERE id = ? AND team_id = ?', [projectId, teamId]);
                if (project.length === 0) return NextResponse.json({ error: 'Geçersiz proje' }, { status: 400 });
            }
            await pool.query<ResultSetHeader>(
                'UPDATE task_templates SET name = ?, title = ?, description = ?, priority = ?, project_id = ? WHERE id = ? AND team_id = ?',
                [name, title, description || null, priority, projectId, id, teamId]
            );
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        const duplicate = typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY';
        return NextResponse.json({ error: duplicate ? 'Bu ad zaten kullanılıyor' : 'Kayıt güncellenemedi' }, { status: duplicate ? 409 : 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ takimId: string }> }) {
    const rejectedBody = rejectOversizedRequest(request);
    if (rejectedBody) return rejectedBody;
    const teamId = Number((await params).takimId);
    const membership = Number.isInteger(teamId) ? await getMembership(request, teamId) : null;
    const body = await request.json();
    if (!membership || membership.role !== 'admin') return NextResponse.json({ error: 'Yönetici yetkisi gereklidir' }, { status: 403 });
    const table = body.type === 'project' ? 'projects' : body.type === 'label' ? 'task_labels' : body.type === 'template' ? 'task_templates' : null;
    const id = Number(body.id);
    if (!table || !Number.isInteger(id)) return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    await pool.query(`DELETE FROM ${table} WHERE id = ? AND team_id = ?`, [id, teamId]);
    return NextResponse.json({ success: true });
}
