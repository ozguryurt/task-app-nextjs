import { NextRequest, NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import {
    hashPassword,
    isExpiryValid,
    isValidEmail,
    isValidPassword,
    isValidVerificationCode,
    verifyPassword,
} from '@/lib/auth-helpers';
import { enforceRateLimit } from '@/lib/rate-limit';
import {
    hashToken,
    normalizeEmail,
    rejectOversizedRequest,
    verifyOneTimeCode,
} from '@/lib/security';

const MAX_CODE_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
    try {
        const rejectedBody = rejectOversizedRequest(request);
        if (rejectedBody) return rejectedBody;

        const body = await request.json();
        const email = normalizeEmail(body.email);
        const code = typeof body.code === 'string' ? body.code.trim() : '';
        const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

        if (!isValidEmail(email) || !isValidVerificationCode(code) || !newPassword) {
            return NextResponse.json(
                { success: false, message: 'E-posta, 6 haneli kod ve yeni şifre gereklidir' },
                { status: 400 }
            );
        }

        const rateLimited = enforceRateLimit(request, {
            scope: 'reset-password-code',
            identifier: hashToken(email),
            limit: 8,
            windowMs: 15 * 60 * 1000,
        });
        if (rateLimited) return rateLimited;

        if (!isValidPassword(newPassword)) {
            return NextResponse.json(
                { success: false, message: 'Şifre 8-72 byte arasında olmalı ve büyük harf, küçük harf ve rakam içermelidir' },
                { status: 400 }
            );
        }

        const [users] = await pool.query<RowDataPacket[]>(
            `SELECT id, password, is_active, email_verified, password_reset_token,
                    password_reset_expires, password_reset_attempts
             FROM users WHERE email = ? LIMIT 1`,
            [email]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Kod geçersiz veya süresi dolmuş' },
                { status: 400 }
            );
        }

        const user = users[0];
        const storedCode = typeof user.password_reset_token === 'string'
            ? user.password_reset_token
            : '';
        const attempts = Number(user.password_reset_attempts) || 0;
        const isExpired = !isExpiryValid(user.password_reset_expires);
        const isValidCode = Boolean(user.is_active && user.email_verified) &&
            !isExpired &&
            attempts < MAX_CODE_ATTEMPTS &&
            verifyOneTimeCode(storedCode, email, 'password-reset', code);

        if (!isValidCode) {
            if (storedCode && !isExpired && attempts < MAX_CODE_ATTEMPTS) {
                await pool.query(
                    `UPDATE users
                     SET password_reset_token = IF(password_reset_attempts + 1 >= ?, NULL, password_reset_token),
                         password_reset_expires = IF(password_reset_attempts + 1 >= ?, NULL, password_reset_expires),
                         password_reset_attempts = LEAST(password_reset_attempts + 1, ?)
                     WHERE id = ?
                       AND password_reset_token = ?
                       AND password_reset_expires > NOW()
                       AND password_reset_attempts < ?`,
                    [
                        MAX_CODE_ATTEMPTS,
                        MAX_CODE_ATTEMPTS,
                        MAX_CODE_ATTEMPTS,
                        user.id,
                        storedCode,
                        MAX_CODE_ATTEMPTS,
                    ]
                );
            }

            return NextResponse.json(
                { success: false, message: 'Kod geçersiz veya süresi dolmuş' },
                { status: 400 }
            );
        }

        const currentPasswordVerification = await verifyPassword(newPassword, user.password);
        if (currentPasswordVerification.isValid) {
            return NextResponse.json(
                { success: false, message: 'Yeni şifre eski şifreniz ile aynı olamaz' },
                { status: 400 }
            );
        }

        const newHashedPassword = await hashPassword(newPassword);
        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE users
             SET password = ?,
                 session_version = session_version + 1,
                 password_reset_token = NULL,
                 password_reset_expires = NULL,
                 password_reset_attempts = 0
             WHERE id = ?
               AND password_reset_token = ?
               AND password_reset_expires > NOW()
               AND password_reset_attempts < ?`,
            [newHashedPassword, user.id, storedCode, MAX_CODE_ATTEMPTS]
        );

        if (result.affectedRows !== 1) {
            return NextResponse.json(
                { success: false, message: 'Kod geçersiz veya süresi dolmuş' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Şifreniz başarıyla güncellendi',
        });
    } catch (error: unknown) {
        console.error('Şifre sıfırlama hatası:', error);
        return NextResponse.json(
            { success: false, message: 'Şifre sıfırlama sırasında bir hata oluştu' },
            { status: 500 }
        );
    }
}
