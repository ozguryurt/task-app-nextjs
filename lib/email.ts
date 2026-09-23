import { escapeHtml } from '@/lib/security';
import nodemailer from 'nodemailer';

interface SendVerificationEmailParams {
    to: string;
    name: string;
    code: string;
}

interface SendPasswordResetEmailParams {
    to: string;
    name: string;
    code: string;
}

interface SendProfileEmailChangeCodeParams {
    to: string;
    name: string;
    code: string;
}

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM || smtpUser || 'no-reply@example.com';

const transporter =
    smtpHost && smtpUser && smtpPass
        ? nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        })
        : null;

export async function sendVerificationEmail({
    to,
    name,
    code,
}: SendVerificationEmailParams) {
    if (!transporter) {
        console.warn('SMTP transporter is not configured. Skipping email send.');
        return;
    }

    const safeName = escapeHtml(name);
    const safeCode = escapeHtml(code);

    await transporter.sendMail({
        from: emailFrom,
        to,
        subject: 'Taskflow - E-posta doğrulama kodu',
        text: `Merhaba ${name}, Taskflow e-posta doğrulama kodunuz: ${code}. Kod 5 dakika geçerlidir.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #111827;">Merhaba ${safeName},</h2>
                <p>Taskflow hesabınızı etkinleştirmek için aşağıdaki kodu doğrulama ekranına girin.</p>
                <p style="margin: 24px 0; padding: 14px; border-radius: 8px; background: #f3f4f6; font-size: 28px; font-weight: 700; letter-spacing: 8px; text-align: center;">${safeCode}</p>
                <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
                <p style="font-size: 12px; color: #6b7280;">
                    Bu kod 5 dakika içinde geçerliliğini yitirir. Kodu kimseyle paylaşmayın.
                </p>
            </div>
        `,
    });
}

export async function sendPasswordResetEmail({
    to,
    name,
    code,
}: SendPasswordResetEmailParams) {
    if (!transporter) {
        console.warn('SMTP transporter is not configured. Skipping email send.');
        return;
    }

    const safeName = escapeHtml(name);
    const safeCode = escapeHtml(code);

    await transporter.sendMail({
        from: emailFrom,
        to,
        subject: 'Taskflow - Şifre Sıfırlama',
        text: `Merhaba ${name}, Taskflow şifre sıfırlama kodunuz: ${code}. Kod 5 dakika geçerlidir.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #111827;">Merhaba ${safeName},</h2>
                <p>Taskflow şifrenizi yenilemek için aşağıdaki kodu sıfırlama ekranına girin.</p>
                <p style="margin: 24px 0; padding: 14px; border-radius: 8px; background: #f3f4f6; font-size: 28px; font-weight: 700; letter-spacing: 8px; text-align: center;">${safeCode}</p>
                <p style="font-size: 12px; color: #6b7280;">Bu kod 5 dakika geçerlidir. Kodu kimseyle paylaşmayın.</p>
            </div>
        `,
    });
}

export async function sendProfileEmailChangeCode({ to, name, code }: SendProfileEmailChangeCodeParams) {
    if (!transporter) {
        throw new Error('E-posta göndermek için SMTP yapılandırması gereklidir');
    }

    const safeName = escapeHtml(name);
    const safeCode = escapeHtml(code);

    await transporter.sendMail({
        from: emailFrom,
        to,
        subject: 'Taskflow - Yeni e-posta adresi doğrulama kodu',
        text: `Merhaba ${name}, Taskflow e-posta adresi değiştirme kodunuz: ${code}. Kod 5 dakika geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı yok sayın.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #111827;">Merhaba ${safeName},</h2>
                <p>Hesabınızdaki yeni e-posta adresini doğrulamak için bu kodu Taskflow profil ekranına girin.</p>
                <p style="margin: 24px 0; padding: 14px; border-radius: 8px; background: #f3f4f6; font-size: 28px; font-weight: 700; letter-spacing: 8px; text-align: center;">${safeCode}</p>
                <p style="font-size: 12px; color: #6b7280;">Kod 5 dakika geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı yok sayın.</p>
            </div>
        `,
    });
}

