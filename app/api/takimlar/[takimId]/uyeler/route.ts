import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/jwt-helpers';
import { RowDataPacket } from 'mysql2';
import { isValidEmail } from '@/lib/auth-helpers';
import { normalizeEmail, rejectOversizedRequest } from '@/lib/security';

// Takım üyelerini çek
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

        // Takım üyelerini çek
        const [members] = await pool.query<RowDataPacket[]>(
            `SELECT 
                tm.id,
                tm.team_id,
                tm.user_id,
                tm.role,
                tm.joined_at,
                u.name,
                u.email,
                u.email_verified
            FROM team_members tm
            INNER JOIN users u ON tm.user_id = u.id
            WHERE tm.team_id = ?
            ORDER BY tm.role DESC, tm.joined_at ASC`,
            [teamId]
        );

        return NextResponse.json(
            {
                members,
                userRole: memberCheck[0].role
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Team Members GET Error:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        );
    }
}

// Takıma üye ekle (sadece admin)
export async function POST(
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

        // Admin yetkisi kontrolü
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
        const email = normalizeEmail(body.email);
        const role = body.role ?? 'member';

        // Validasyon
        if (!email || !isValidEmail(email)) {
            return NextResponse.json(
                { error: 'E-posta adresi zorunludur' },
                { status: 400 }
            );
        }

        if (!['admin', 'member'].includes(role)) {
            return NextResponse.json(
                { error: 'Geçersiz rol' },
                { status: 400 }
            );
        }

        // Kullanıcıyı bul
        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT id, name, email FROM users WHERE email = ? AND is_active = true',
            [email]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { error: 'Kullanıcı bulunamadı' },
                { status: 404 }
            );
        }

        const newUserId = users[0].id;

        // Kullanıcı takıma zaten üye mi kontrol et
        const [existingMember] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM team_members WHERE team_id = ? AND user_id = ?',
            [teamId, newUserId]
        );

        if (existingMember.length > 0) {
            return NextResponse.json(
                { error: 'Bu kullanıcı zaten takım üyesi' },
                { status: 400 }
            );
        }

        // Üye ekle
        await pool.query(
            'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
            [teamId, newUserId, role]
        );

        // Eklenen üyeyi çek
        const [newMembers] = await pool.query<RowDataPacket[]>(
            `SELECT 
                tm.id,
                tm.team_id,
                tm.user_id,
                tm.role,
                tm.joined_at,
                u.name,
                u.email,
                u.email_verified
            FROM team_members tm
            INNER JOIN users u ON tm.user_id = u.id
            WHERE tm.team_id = ? AND tm.user_id = ?`,
            [teamId, newUserId]
        );

        return NextResponse.json(
            {
                message: 'Üye başarıyla eklendi',
                member: newMembers[0]
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Team Members POST Error:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        );
    }
}

