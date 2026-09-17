import { NextRequest, NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import {
    generateVerificationCode,
    getCodeExpiry,
    isExpiryValid,
    isValidEmail,
    isValidVerificationCode,
} from '@/lib/auth-helpers';
import { sendVerificationEmail } from '@/lib/email';
import { enforceRateLimit } from '@/lib/rate-limit';
import {
    hashOneTimeCode,
    hashToken,
    normalizeEmail,
    rejectOversizedRequest,
    verifyOneTimeCode,
} from '@/lib/security';

const MAX_CODE_ATTEMPTS = 5;
const GENERIC_SEND_MESSAGE = 'Hesap uygunsa 6 haneli doğrulama kodu e-posta adresine gönderildi';

export async function POST(request: NextRequest) {
    try {
        const rejectedBody = rejectOversizedRequest(request);
        if (rejectedBody) return rejectedBody;

        const body = await request.json();
        const email = normalizeEmail(body.email);
        const code = typeof body.code === 'string' ? body.code.trim() : undefined;

        if (!email || !isValidEmail(email)) {
            return NextResponse.json(
                { success: false, message: 'Geçerli bir e-posta adresi gereklidir' },
                { status: 400 }
            );
        }

        if (code !== undefined) {
            const rateLimited = enforceRateLimit(request, {
                scope: 'verify-email-code',
                identifier: hashToken(email),
                limit: 8,
                windowMs: 15 * 60 * 1000,
            });
            if (rateLimited) return rateLimited;

            if (!isValidVerificationCode(code)) {
                return NextResponse.json(
                    { success: false, message: 'Kod 6 rakamdan oluşmalıdır' },
                    { status: 400 }
                );
            }

            const [users] = await pool.query<RowDataPacket[]>(
                `SELECT id, email_verified, email_verification_token, email_verification_expires,
                        email_verification_attempts
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
            if (user.email_verified) {
                return NextResponse.json(
                    { success: false, message: 'Kod geçersiz veya süresi dolmuş' },
                    { status: 400 }
                );
            }

            const storedCode = typeof user.email_verification_token === 'string'
                ? user.email_verification_token
                : '';
            const attempts = Number(user.email_verification_attempts) || 0;
            const isExpired = !isExpiryValid(user.email_verification_expires);
            const isValidCode = !isExpired && attempts < MAX_CODE_ATTEMPTS &&
                verifyOneTimeCode(storedCode, email, 'email-verification', code);

            if (!isValidCode) {
                if (storedCode && !isExpired && attempts < MAX_CODE_ATTEMPTS) {
                    await pool.query(
                        `UPDATE users
                         SET email_verification_token = IF(email_verification_attempts + 1 >= ?, NULL, email_verification_token),
                             email_verification_expires = IF(email_verification_attempts + 1 >= ?, NULL, email_verification_expires),
                             email_verification_attempts = LEAST(email_verification_attempts + 1, ?)
                         WHERE id = ?
                           AND email_verification_token = ?
                           AND email_verification_expires > NOW()
                           AND email_verification_attempts < ?`,
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

            const [result] = await pool.query<ResultSetHeader>(
                `UPDATE users
                 SET email_verified = TRUE,
                     email_verification_token = NULL,
                     email_verification_expires = NULL,
                     email_verification_attempts = 0
                 WHERE id = ?
                   AND email_verified = FALSE
                   AND email_verification_token = ?
                   AND email_verification_expires > NOW()
                   AND email_verification_attempts < ?`,
                [user.id, storedCode, MAX_CODE_ATTEMPTS]
            );

            if (result.affectedRows !== 1) {
                return NextResponse.json(
                    { success: false, message: 'Kod geçersiz veya süresi dolmuş' },
                    { status: 400 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'E-posta adresiniz başarıyla doğrulandı',
            });
        }

        const rateLimited = enforceRateLimit(request, {
            scope: 'send-email-code',
            identifier: hashToken(email),
            limit: 3,
            windowMs: 60 * 60 * 1000,
        });
        if (rateLimited) return rateLimited;

        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT id, email, name, email_verified FROM users WHERE email = ? LIMIT 1',
            [email]
        );

        if (users.length === 0 || users[0].email_verified) {
            return NextResponse.json({ success: true, message: GENERIC_SEND_MESSAGE });
        }

        const user = users[0];
        const verificationCode = generateVerificationCode();
        await pool.query(
            `UPDATE users
             SET email_verification_token = ?,
                 email_verification_expires = ?,
                 email_verification_attempts = 0
             WHERE id = ?`,
            [
                hashOneTimeCode(email, 'email-verification', verificationCode),
                getCodeExpiry(),
                user.id,
            ]
        );

        try {
            await sendVerificationEmail({
                to: user.email,
                name: user.name || user.email,
                code: verificationCode,
            });
        } catch (emailError) {
            console.error('Doğrulama kodu e-postası gönderilemedi:', emailError);
        }

        return NextResponse.json({ success: true, message: GENERIC_SEND_MESSAGE });
    } catch (error: unknown) {
        console.error('E-posta doğrulama hatası:', error);
        return NextResponse.json(
            { success: false, message: 'E-posta doğrulama sırasında bir hata oluştu' },
            { status: 500 }
        );
    }
}
