import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/jwt-helpers';
import { RowDataPacket } from 'mysql2';
import { rejectOversizedRequest } from '@/lib/security';

// Üye rolünü güncelle (sadece admin)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ takimId: string; uyeId: string }> }
) {
    try {
        const rejectedBody = rejectOversizedRequest(request);
        if (rejectedBody) return rejectedBody;

        const { takimId: teamId, uyeId: memberId } = await params;
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
        const { role } = body;

        // Validasyon
        if (!['admin', 'member'].includes(role)) {
            return NextResponse.json(
                { error: 'Geçersiz rol' },
                { status: 400 }
            );
        }

        // Üye var mı kontrol et
        const [targetMember] = await pool.query<RowDataPacket[]>(
            'SELECT user_id FROM team_members WHERE id = ? AND team_id = ?',
            [memberId, teamId]
        );

        if (targetMember.length === 0) {
            return NextResponse.json(
                { error: 'Üye bulunamadı' },
                { status: 404 }
            );
        }

        // Kendi rolünü değiştiremesin
        if (targetMember[0].user_id === userId) {
            return NextResponse.json(
                { error: 'Kendi rolünüzü değiştiremezsiniz' },
                { status: 400 }
            );
        }

        // Rolü güncelle
        await pool.query(
            'UPDATE team_members SET role = ? WHERE id = ? AND team_id = ?',
            [role, memberId, teamId]
        );

        return NextResponse.json(
            { message: 'Üye rolü başarıyla güncellendi' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Team Member PUT Error:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        );
    }
}

// Üyeyi takımdan çıkar (sadece admin)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ takimId: string; uyeId: string }> }
) {
    try {
        const { takimId: teamId, uyeId: memberId } = await params;
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

        // Üye var kontrol et
        const [targetMember] = await pool.query<RowDataPacket[]>(
            'SELECT user_id, role FROM team_members WHERE id = ? AND team_id = ?',
            [memberId, teamId]
        );

        if (targetMember.length === 0) {
            return NextResponse.json(
                { error: 'Üye bulunamadı' },
                { status: 404 }
            );
        }

        // Kendini çıkaramasın
        if (targetMember[0].user_id === userId) {
            return NextResponse.json(
                { error: 'Kendinizi takımdan çıkaramazsınız' },
                { status: 400 }
            );
        }

        // Takımdaki son admin mi kontrol et (en az 1 tane kalmalı)
        const [adminCount] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM team_members WHERE team_id = ? AND role = ?',
            [teamId, 'admin']
        );

        if (targetMember[0].role === 'admin' && adminCount[0].count <= 1) {
            return NextResponse.json(
                { error: 'Takımda en az bir admin bulunmalıdır' },
                { status: 400 }
            );
        }

        // Üyeyi sil
        await pool.query(
            'DELETE FROM team_members WHERE id = ? AND team_id = ?',
            [memberId, teamId]
        );

        return NextResponse.json(
            { message: 'Üye başarıyla çıkarıldı' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Team Member DELETE Error:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        );
    }
}

