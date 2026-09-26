import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/jwt-helpers';
import { isValidId } from '@/lib/security';

export default async function TeamLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ takimId: string }>;
}) {
    const { takimId } = await params;
    if (!isValidId(takimId) || !Number.isSafeInteger(Number(takimId))) {
        redirect('/panel/takimlar');
    }

    const token = (await cookies()).get('auth-token')?.value;
    if (!token) redirect('/giris');
    const auth = await verifyJWT(token);
    if (!auth.valid || !auth.payload) redirect('/giris');

    const [members] = await pool.query<RowDataPacket[]>(
        'SELECT user_id FROM team_members WHERE team_id = ? AND user_id = ? LIMIT 1',
        [Number(takimId), auth.payload.userId]
    );
    if (members.length === 0) redirect('/panel/takimlar');

    return children;
}
