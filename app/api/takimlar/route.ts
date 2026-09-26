import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/jwt-helpers';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { rejectOversizedRequest } from '@/lib/security';

// Kullanıcının tüm takımlarını çek
export async function GET(request: NextRequest) {
    try {
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

        // Kullanıcının üye olduğu tüm takımları çek
        const [teams] = await pool.query<RowDataPacket[]>(
            `SELECT 
                t.id,
                t.name,
                t.description,
                t.created_by,
                t.created_at,
                t.updated_at,
                tm.role as user_role,
                u.name as creator_name,
                (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
            FROM teams t
            INNER JOIN team_members tm ON t.id = tm.team_id
            LEFT JOIN users u ON t.created_by = u.id
            WHERE tm.user_id = ?
            ORDER BY t.created_at DESC`,
            [userId]
        );

        return NextResponse.json({ teams }, { status: 200, headers: { 'Cache-Control': 'private, no-store' } });
    } catch (error) {
        console.error('Teams GET Error:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        );
    }
}

// Yeni takım oluştur
export async function POST(request: NextRequest) {
    try {
        const rejectedBody = rejectOversizedRequest(request);
        if (rejectedBody) return rejectedBody;

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

        // Transaction başlat
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Takımı oluştur
            const [result] = await connection.query<ResultSetHeader>(
                'INSERT INTO teams (name, description, created_by) VALUES (?, ?, ?)',
                [name, description || null, userId]
            );

            const teamId = result.insertId;

            // Oluşturan kişiyi admin olarak ekle
            await connection.query(
                'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
                [teamId, userId, 'admin']
            );

            await connection.commit();

            // Oluşturulan takımı getir
            const [teams] = await connection.query<RowDataPacket[]>(
                `SELECT 
                    t.id,
                    t.name,
                    t.description,
                    t.created_by,
                    t.created_at,
                    t.updated_at,
                    'admin' as user_role,
                    u.name as creator_name,
                    1 as member_count
                FROM teams t
                LEFT JOIN users u ON t.created_by = u.id
                WHERE t.id = ?`,
                [teamId]
            );

            return NextResponse.json(
                {
                    message: 'Takım başarıyla oluşturuldu',
                    team: teams[0]
                },
                { status: 201 }
            );
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Teams POST Error:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        );
    }
}

