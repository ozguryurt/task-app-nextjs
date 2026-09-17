import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/jwt-helpers';
import { RowDataPacket } from 'mysql2';
import { rejectOversizedRequest } from '@/lib/security';

// Takım detaylarını çek
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ takimId: string }> }
) {
    try {
        const { takimId: teamId } = await params;
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Oturum bulunamadı' },
                { status: 401 }
            );
        }

        const result = await verifyJWT(token);
        if (!result.valid || !result.payload) {
            return NextResponse.json(
                { error: result.error || 'Geçersiz token' },
                { status: 401 }
            );
        }

        const userId = result.payload.userId;

        // Kullanıcı takım üyesi mi kontrol et
        const [memberCheck] = await pool.query<RowDataPacket[]>(
            'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
            [teamId, userId]
        );

        if (memberCheck.length === 0) {
            return NextResponse.json(
                { error: 'Bu takıma erişim yetkiniz yok' },
                { status: 403 }
            );
        }

        // Takım bilgilerini çek
        const [teams] = await pool.query<RowDataPacket[]>(
            `SELECT 
                t.id,
                t.name,
                t.description,
                t.created_by,
                t.created_at,
                t.updated_at,
                u.name as creator_name
            FROM teams t
            LEFT JOIN users u ON t.created_by = u.id
            WHERE t.id = ?`,
            [teamId]
        );

        if (teams.length === 0) {
            return NextResponse.json(
                { error: 'Takım bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                team: teams[0],
                userRole: memberCheck[0].role
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Team GET Error:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        );
    }
}

// Takım bilgilerini güncelle (sadece admin)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ takimId: string }> }
) {
    try {
        const rejectedBody = rejectOversizedRequest(request);
        if (rejectedBody) return rejectedBody;

        const { takimId: teamId } = await params;
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Oturum bulunamadı' },
                { status: 401 }
            );
        }

        const result = await verifyJWT(token);
        if (!result.valid || !result.payload) {
            return NextResponse.json(
                { error: result.error || 'Geçersiz token' },
                { status: 401 }
            );
        }

        const userId = result.payload.userId;

        // Admin yetkisi kontrol et
        const [memberCheck] = await pool.query<RowDataPacket[]>(
            'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
            [teamId, userId]
        );

        if (memberCheck.length === 0 || memberCheck[0].role !== 'admin') {
            return NextResponse.json(
                { error: 'Bu işlem için admin yetkisi gereklidir' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const description = typeof body.description === 'string' ? body.description.trim() : '';

        // Validasyon
        if (!name) {
            return NextResponse.json(
                { error: 'Takım adı zorunludur' },
                { status: 400 }
            );
        }

        if (name.length > 255 || description.length > 10_000) {
            return NextResponse.json(
                { error: 'Takım adı çok uzun' },
                { status: 400 }
            );
        }

        // Takımı güncelle
        await pool.query(
            'UPDATE teams SET name = ?, description = ? WHERE id = ?',
            [name, description || null, teamId]
        );

        return NextResponse.json(
            { message: 'Takım başarıyla güncellendi' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Team PUT Error:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        );
    }
}

// Takımı sil (sadece admin)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ takimId: string }> }
) {
    try {
        const { takimId: teamId } = await params;
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Oturum bulunamadı' },
                { status: 401 }
            );
        }

        const result = await verifyJWT(token);
        if (!result.valid || !result.payload) {
            return NextResponse.json(
                { error: result.error || 'Geçersiz token' },
                { status: 401 }
            );
        }

        const userId = result.payload.userId;

        // Admin yetkisi kontrol et
        const [memberCheck] = await pool.query<RowDataPacket[]>(
            'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
            [teamId, userId]
        );

        if (memberCheck.length === 0 || memberCheck[0].role !== 'admin') {
            return NextResponse.json(
                { error: 'Bu işlem için admin yetkisi gereklidir' },
                { status: 403 }
            );
        }

        // Takımı sil (CASCADE sayesinde üyeler ve görevler de birlikte silinir)
        await pool.query('DELETE FROM teams WHERE id = ?', [teamId]);

        return NextResponse.json(
            { message: 'Takım başarıyla silindi' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Team DELETE Error:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        );
    }
}

