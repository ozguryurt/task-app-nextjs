import { NextRequest, NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/jwt-helpers';
import { rejectOversizedRequest } from '@/lib/security';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ takimId: string }> };

const dateSchema = z.union([z.iso.date(), z.literal(''), z.null()]).optional();
const fields = {
    name: z.string().trim().min(1, 'Kilometre taşı adı gereklidir').max(120),
    description: z.string().trim().max(500).nullable().optional(),
    target_date: dateSchema,
};
const createSchema = z.object({ project_id: z.number().int().positive(), ...fields }).strict();
const updateSchema = z.object({ id: z.number().int().positive(), ...fields }).strict();
const deleteSchema = z.object({ id: z.number().int().positive() }).strict();

async function access(request: NextRequest, context: Context) {
    const teamId = Number((await context.params).takimId);
    if (!Number.isInteger(teamId) || teamId <= 0) return { teamId: 0, userId: 0, role: null };
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return { teamId, userId: 0, role: null };
    const verified = await verifyJWT(token);
    if (!verified.valid || !verified.payload) return { teamId, userId: 0, role: null };
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT role FROM team_members WHERE team_id = ? AND user_id = ? LIMIT 1',
        [teamId, verified.payload.userId]
    );
    return { teamId, userId: verified.payload.userId, role: rows[0]?.role as 'admin' | 'member' | undefined ?? null };
}

function failure(error: unknown) {
    const duplicate = typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY';
    if (!duplicate) console.error('Milestone API error:', error);
    return NextResponse.json({ error: duplicate ? 'Bu projede aynı adlı kilometre taşı var' : 'Kilometre taşı işlemi tamamlanamadı' }, { status: duplicate ? 409 : 500 });
}

export async function GET(request: NextRequest, context: Context) {
    try {
        const { teamId, role } = await access(request, context);
        if (!role) return NextResponse.json({ error: 'Bu takıma erişim yetkiniz yok' }, { status: 403 });
        const [milestones] = await pool.query<RowDataPacket[]>(
            `SELECT id, team_id, project_id, name, description, target_date
             FROM project_milestones WHERE team_id = ? ORDER BY target_date IS NULL, target_date, id`,
            [teamId]
        );
        return NextResponse.json({ milestones }, { headers: { 'Cache-Control': 'private, no-store' } });
    } catch (error) { return failure(error); }
}

export async function POST(request: NextRequest, context: Context) {
    const rejected = rejectOversizedRequest(request);
    if (rejected) return rejected;
    try {
        const { teamId, userId, role } = await access(request, context);
        if (role !== 'admin') return NextResponse.json({ error: 'Yönetici yetkisi gereklidir' }, { status: 403 });
        const parsed = createSchema.safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
        const { project_id, name, description, target_date } = parsed.data;
        const [projects] = await pool.query<RowDataPacket[]>('SELECT id FROM projects WHERE id = ? AND team_id = ?', [project_id, teamId]);
        if (!projects.length) return NextResponse.json({ error: 'Geçersiz proje' }, { status: 400 });
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO project_milestones (team_id, project_id, name, description, target_date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
            [teamId, project_id, name, description || null, target_date || null, userId]
        );
        return NextResponse.json({ id: result.insertId }, { status: 201 });
    } catch (error) { return failure(error); }
}

export async function PUT(request: NextRequest, context: Context) {
    const rejected = rejectOversizedRequest(request);
    if (rejected) return rejected;
    try {
        const { teamId, role } = await access(request, context);
        if (role !== 'admin') return NextResponse.json({ error: 'Yönetici yetkisi gereklidir' }, { status: 403 });
        const parsed = updateSchema.safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
        const { id, name, description, target_date } = parsed.data;
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE project_milestones SET name = ?, description = ?, target_date = ? WHERE id = ? AND team_id = ?',
            [name, description || null, target_date || null, id, teamId]
        );
        if (!result.affectedRows) return NextResponse.json({ error: 'Kilometre taşı bulunamadı' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error) { return failure(error); }
}

export async function DELETE(request: NextRequest, context: Context) {
    const rejected = rejectOversizedRequest(request);
    if (rejected) return rejected;
    try {
        const { teamId, userId, role } = await access(request, context);
        if (role !== 'admin') return NextResponse.json({ error: 'Yönetici yetkisi gereklidir' }, { status: 403 });
        const parsed = deleteSchema.safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ error: 'Geçersiz kilometre taşı' }, { status: 400 });
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [existing] = await connection.query<RowDataPacket[]>(
                'SELECT id FROM project_milestones WHERE id = ? AND team_id = ? FOR UPDATE',
                [parsed.data.id, teamId]
            );
            if (!existing.length) {
                await connection.rollback();
                return NextResponse.json({ error: 'Kilometre taşı bulunamadı' }, { status: 404 });
            }
            await connection.query(
                `INSERT INTO task_activity (task_id, actor_id, event_type, field_name, old_value, new_value)
                 SELECT id, ?, 'updated', 'milestone_id', CAST(milestone_id AS CHAR), NULL
                 FROM tasks WHERE team_id = ? AND milestone_id = ?`,
                [userId, teamId, parsed.data.id]
            );
            await connection.query('DELETE FROM project_milestones WHERE id = ? AND team_id = ?', [parsed.data.id, teamId]);
            await connection.commit();
            return NextResponse.json({ success: true });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) { return failure(error); }
}
