import { NextRequest, NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import {
    generateVerificationCode,
    getCodeExpiry,
    isExpiryValid,
    isValidEmail,
    isValidPassword,
    isValidVerificationCode,
    hashPassword,
    verifyPassword,
} from '@/lib/auth-helpers';
import { sendProfileEmailChangeCode } from '@/lib/email';
import { verifyJWT, signJWT } from '@/lib/jwt-helpers';
import { enforceRateLimit } from '@/lib/rate-limit';
import {
    hashOneTimeCode,
    hashToken,
    normalizeEmail,
    rejectOversizedRequest,
    verifyOneTimeCode,
} from '@/lib/security';

const MAX_CODE_ATTEMPTS = 5;
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

interface ProfileRow extends RowDataPacket {
    id: number;
    email: string;
    password: string;
    name: string;
    avatar_url: string | null;
    email_verified: boolean | number;
    created_at: Date | string;
    is_active: boolean | number;
    session_version: number;
}

interface EmailChangeRow extends RowDataPacket {
    pending_email: string;
    code_hash: string;
    expires_at: Date | string;
    attempts: number;
}

async function authenticate(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    const verification = await verifyJWT(token);
    return verification.valid ? verification.payload ?? null : null;
}

function profileResponse(user: ProfileRow) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        emailVerified: Boolean(user.email_verified),
        createdAt: user.created_at,
    };
}

function setSessionCookie(response: NextResponse, user: ProfileRow, sessionVersion: number) {
    const token = signJWT({
        userId: user.id,
        email: user.email,
        name: user.name,
        sessionVersion,
    });

    response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_COOKIE_MAX_AGE,
        path: '/',
    });
}

async function getProfileUser(userId: number) {
    const [users] = await pool.query<ProfileRow[]>(
        `SELECT id, email, password, name, avatar_url, email_verified, created_at, is_active, session_version
         FROM users WHERE id = ? LIMIT 1`,
        [userId]
    );
    return users[0] ?? null;
}

export async function GET(request: NextRequest) {
    try {
        const session = await authenticate(request);
        if (!session) return NextResponse.json({ success: false, message: 'Oturum süresi dolmuş' }, { status: 401 });

        const user = await getProfileUser(session.userId);
        if (!user || !user.is_active) return NextResponse.json({ success: false, message: 'Kullanıcı bulunamadı' }, { status: 404 });

        return NextResponse.json({ success: true, data: { user: profileResponse(user) } }, {
            headers: { 'Cache-Control': 'no-store, max-age=0' },
        });
    } catch (error) {
        console.error('Profil bilgileri yüklenirken hata:', error);
        return NextResponse.json({ success: false, message: 'Profil bilgileri yüklenemedi' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    let connection: Awaited<ReturnType<typeof pool.getConnection>> | null = null;

    try {
        const rejectedBody = rejectOversizedRequest(request);
        if (rejectedBody) return rejectedBody;

        const session = await authenticate(request);
        if (!session) return NextResponse.json({ success: false, message: 'Oturum süresi dolmuş' }, { status: 401 });

        const body = await request.json();
        const action = typeof body.action === 'string' ? body.action : '';
        if (!['change-password', 'request-email-change', 'verify-email-change'].includes(action)) {
            return NextResponse.json({ success: false, message: 'Geçersiz profil işlemi' }, { status: 400 });
        }
        const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
        if (!currentPassword) return NextResponse.json({ success: false, message: 'Mevcut şifrenizi girin' }, { status: 400 });

        const rateLimitConfig = action === 'change-password'
            ? { scope: 'profile-password-change', limit: 5, windowMs: 15 * 60 * 1000 }
            : action === 'request-email-change'
                ? { scope: 'profile-email-change-request', limit: 3, windowMs: 60 * 60 * 1000 }
                : action === 'verify-email-change'
                    ? { scope: 'profile-email-change-verify', limit: 8, windowMs: 15 * 60 * 1000 }
                    : null;
        if (rateLimitConfig) {
            const rateLimited = enforceRateLimit(request, {
                ...rateLimitConfig,
                identifier: hashToken(String(session.userId)),
            });
            if (rateLimited) return rateLimited;
        }

        const user = await getProfileUser(session.userId);
        if (!user || !user.is_active) return NextResponse.json({ success: false, message: 'Kullanıcı bulunamadı' }, { status: 404 });

        const passwordCheck = await verifyPassword(currentPassword, user.password);
        if (!passwordCheck.isValid) return NextResponse.json({ success: false, message: 'Mevcut şifreniz hatalı' }, { status: 403 });

        if (action === 'change-password') {
            const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
            const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';
            if (!isValidPassword(newPassword)) {
                return NextResponse.json({ success: false, message: 'Yeni şifre en az 8 karakter olmalı; büyük harf, küçük harf ve rakam içermelidir' }, { status: 400 });
            }
            if (newPassword !== confirmPassword) return NextResponse.json({ success: false, message: 'Yeni şifreler eşleşmiyor' }, { status: 400 });

            const samePassword = await verifyPassword(newPassword, user.password);
            if (samePassword.isValid) return NextResponse.json({ success: false, message: 'Yeni şifreniz mevcut şifrenizden farklı olmalıdır' }, { status: 400 });

            const newHash = await hashPassword(newPassword);
            const nextSessionVersion = Number(user.session_version) + 1;
            const [result] = await pool.query<ResultSetHeader>(
                `UPDATE users SET password = ?, session_version = ?
                 WHERE id = ? AND password = ? AND session_version = ?`,
                [newHash, nextSessionVersion, user.id, user.password, session.sessionVersion]
            );
            if (result.affectedRows !== 1) return NextResponse.json({ success: false, message: 'Oturumunuz yenilendi. Lütfen tekrar giriş yapın.' }, { status: 409 });

            user.password = newHash;
            user.session_version = nextSessionVersion;
            const response = NextResponse.json({ success: true, message: 'Şifreniz güncellendi', data: { user: profileResponse(user) } });
            setSessionCookie(response, user, nextSessionVersion);
            await pool.query('DELETE FROM profile_email_change_codes WHERE user_id = ?', [user.id]);
            return response;
        }

        if (action === 'request-email-change') {
            const newEmail = normalizeEmail(body.newEmail);
            if (!isValidEmail(newEmail)) return NextResponse.json({ success: false, message: 'Geçerli bir e-posta adresi girin' }, { status: 400 });
            if (newEmail === user.email) return NextResponse.json({ success: false, message: 'Yeni e-posta adresi mevcut adresinizle aynı' }, { status: 400 });

            const [existingUsers] = await pool.query<RowDataPacket[]>(
                'SELECT id FROM users WHERE email = ? LIMIT 1',
                [newEmail]
            );
            if (existingUsers.length) return NextResponse.json({ success: false, message: 'Bu e-posta adresi başka bir hesap tarafından kullanılıyor' }, { status: 409 });

            const code = generateVerificationCode();
            const codeHash = hashOneTimeCode(newEmail, 'profile-email-change', code);
            await pool.query(
                `INSERT INTO profile_email_change_codes (user_id, pending_email, code_hash, expires_at, attempts)
                 VALUES (?, ?, ?, ?, 0)
                 ON DUPLICATE KEY UPDATE pending_email = VALUES(pending_email), code_hash = VALUES(code_hash),
                    expires_at = VALUES(expires_at), attempts = 0`,
                [user.id, newEmail, codeHash, getCodeExpiry()]
            );

            try {
                await sendProfileEmailChangeCode({ to: newEmail, name: user.name, code });
            } catch (emailError) {
                await pool.query('DELETE FROM profile_email_change_codes WHERE user_id = ? AND code_hash = ?', [user.id, codeHash]);
                throw emailError;
            }

            return NextResponse.json({ success: true, message: 'Doğrulama kodu yeni e-posta adresinize gönderildi' });
        }

        if (action === 'verify-email-change') {
            const code = typeof body.code === 'string' ? body.code.trim() : '';
            if (!isValidVerificationCode(code)) return NextResponse.json({ success: false, message: 'Kod 6 rakamdan oluşmalıdır' }, { status: 400 });

            connection = await pool.getConnection();
            await connection.beginTransaction();
            const [codeRows] = await connection.query<EmailChangeRow[]>(
                `SELECT pending_email, code_hash, expires_at, attempts
                 FROM profile_email_change_codes WHERE user_id = ? FOR UPDATE`,
                [user.id]
            );
            const pending = codeRows[0];
            const isValidCode = Boolean(pending) && Number(pending.attempts) < MAX_CODE_ATTEMPTS &&
                isExpiryValid(pending.expires_at) &&
                verifyOneTimeCode(pending.code_hash, pending.pending_email, 'profile-email-change', code);

            if (!isValidCode || !pending) {
                if (pending && isExpiryValid(pending.expires_at) && Number(pending.attempts) < MAX_CODE_ATTEMPTS) {
                    await connection.query(
                        `UPDATE profile_email_change_codes
                         SET attempts = attempts + 1
                         WHERE user_id = ? AND code_hash = ? AND attempts < ?`,
                        [user.id, pending.code_hash, MAX_CODE_ATTEMPTS]
                    );
                }
                await connection.commit();
                return NextResponse.json({ success: false, message: 'Kod geçersiz veya süresi dolmuş' }, { status: 400 });
            }

            const [existingUsers] = await connection.query<RowDataPacket[]>(
                'SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1',
                [pending.pending_email, user.id]
            );
            if (existingUsers.length) {
                await connection.query('DELETE FROM profile_email_change_codes WHERE user_id = ?', [user.id]);
                await connection.commit();
                return NextResponse.json({ success: false, message: 'Bu e-posta adresi artık kullanılamıyor; yeniden deneyin' }, { status: 409 });
            }

            const nextSessionVersion = Number(user.session_version) + 1;
            const [result] = await connection.query<ResultSetHeader>(
                `UPDATE users
                 SET email = ?, email_verified = TRUE,
                     email_verification_token = NULL, email_verification_expires = NULL,
                     email_verification_attempts = 0, session_version = ?
                 WHERE id = ? AND session_version = ?`,
                [pending.pending_email, nextSessionVersion, user.id, session.sessionVersion]
            );
            if (result.affectedRows !== 1) {
                await connection.rollback();
                return NextResponse.json({ success: false, message: 'Oturumunuz yenilendi. Lütfen tekrar giriş yapın.' }, { status: 409 });
            }

            await connection.query('DELETE FROM profile_email_change_codes WHERE user_id = ?', [user.id]);
            await connection.commit();

            user.email = pending.pending_email;
            user.email_verified = true;
            user.session_version = nextSessionVersion;
            const response = NextResponse.json({ success: true, message: 'E-posta adresiniz güncellendi', data: { user: profileResponse(user) } });
            setSessionCookie(response, user, nextSessionVersion);
            return response;
        }

        return NextResponse.json({ success: false, message: 'Geçersiz profil işlemi' }, { status: 400 });
    } catch (error: unknown) {
        if (connection) await connection.rollback().catch(() => undefined);
        console.error('Profil işlemi başarısız:', error);
        const dbError = error as { code?: string };
        if (dbError.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ success: false, message: 'Bu e-posta adresi başka bir hesap tarafından kullanılıyor' }, { status: 409 });
        }
        return NextResponse.json({ success: false, message: 'Profil güncellenirken bir hata oluştu' }, { status: 500 });
    } finally {
        connection?.release();
    }
}
