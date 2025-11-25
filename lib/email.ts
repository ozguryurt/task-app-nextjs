import nodemailer from 'nodemailer';

interface SendVerificationEmailParams {
    to: string;
    name: string;
    verificationLink: string;
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
    verificationLink,
}: SendVerificationEmailParams) {
    if (!transporter) {
        console.warn('SMTP transporter is not configured. Skipping email send.');
        return;
    }

    await transporter.sendMail({
        from: emailFrom,
        to,
        subject: 'Task App Next.js - E-posta Doğrulaması',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #111827;">Merhaba ${name},</h2>
                <p>Task App Next.js hesabınızı aktive etmek için e-posta adresinizi doğrulamanız gerekiyor.</p>
                <p style="margin: 24px 0;">
                    <a href="${verificationLink}" style="background-color: #2563eb; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        E-posta Adresimi Doğrula
                    </a>
                </p>
                <p>Butona tıklayamıyorsanız aşağıdaki bağlantıyı tarayıcınıza yapıştırabilirsiniz:</p>
                <p style="word-break: break-word; color: #2563eb;">${verificationLink}</p>
                <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
                <p style="font-size: 12px; color: #6b7280;">
                    Bu bağlantı 24 saat içinde geçerliliğini yitirir. Eğer bu isteği siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.
                </p>
            </div>
        `,
    });
}

