import { NextRequest, NextResponse } from 'next/server';
import type { ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/jwt-helpers';
import { enforceRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_IMAGE_BYTES + 64 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
};

function hasValidSignature(bytes: Uint8Array, mimeType: string) {
    if (mimeType === 'image/png') {
        return bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
    }
    if (mimeType === 'image/jpeg') {
        return bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    }
    if (mimeType === 'image/webp') {
        return bytes.length >= 12 &&
            String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF' &&
            String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP';
    }
    return false;
}

async function readBoundedMultipart(request: NextRequest, contentType: string) {
    if (!request.body) return null;
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > MAX_REQUEST_BYTES) {
            await reader.cancel();
            return null;
        }
        chunks.push(value);
    }

    const body = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.byteLength;
    }

    return new Request(request.url, {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body,
    }).formData();
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'Oturum açmanız gerekiyor' }, { status: 401 });
        const session = await verifyJWT(token);
        if (!session.valid || !session.payload) {
            return NextResponse.json({ success: false, message: 'Oturum süresi dolmuş' }, { status: 401 });
        }

        const rateLimited = enforceRateLimit(request, {
            scope: 'profile-photo-upload',
            identifier: String(session.payload.userId),
            limit: 10,
            windowMs: 60 * 60 * 1000,
        });
        if (rateLimited) return rateLimited;

        const apiKey = process.env.IMGBB_API_KEY?.trim();
        if (!apiKey) {
            return NextResponse.json({ success: false, message: 'Fotoğraf yükleme henüz yapılandırılmamış' }, { status: 503 });
        }

        const contentType = request.headers.get('content-type') ?? '';
        if (!contentType.toLowerCase().startsWith('multipart/form-data;')) {
            return NextResponse.json({ success: false, message: 'Geçersiz yükleme biçimi' }, { status: 400 });
        }
        const contentLength = Number(request.headers.get('content-length'));
        if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
            return NextResponse.json({ success: false, message: 'Dosya en fazla 3 MB olabilir' }, { status: 413 });
        }

        let formData: FormData | null;
        try {
            formData = await readBoundedMultipart(request, contentType);
        } catch {
            return NextResponse.json({ success: false, message: 'Dosya okunamadı' }, { status: 400 });
        }
        if (!formData) return NextResponse.json({ success: false, message: 'Dosya en fazla 3 MB olabilir' }, { status: 413 });

        const image = formData.get('image');
        if (!(image instanceof File)) {
            return NextResponse.json({ success: false, message: 'Bir profil fotoğrafı seçin' }, { status: 400 });
        }
        const extension = image.name.split('.').pop()?.toLowerCase() ?? '';
        const expectedMimeType = ALLOWED_TYPES[extension];
        if (!expectedMimeType || image.type.toLowerCase() !== expectedMimeType) {
            return NextResponse.json({ success: false, message: 'Yalnızca PNG, JPG, JPEG veya WEBP dosyaları yüklenebilir' }, { status: 400 });
        }
        if (image.size === 0 || image.size > MAX_IMAGE_BYTES) {
            return NextResponse.json({ success: false, message: 'Dosya boş olamaz ve en fazla 3 MB olabilir' }, { status: 413 });
        }

        const bytes = new Uint8Array(await image.arrayBuffer());
        if (!hasValidSignature(bytes, expectedMimeType)) {
            return NextResponse.json({ success: false, message: 'Dosyanın görsel biçimi geçersiz' }, { status: 400 });
        }

        const upload = new FormData();
        upload.append('image', image, `avatar-${session.payload.userId}.${extension}`);
        const upstreamResponse = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            body: upload,
            cache: 'no-store',
            signal: AbortSignal.timeout(30_000),
        });
        const upstreamData = await upstreamResponse.json().catch(() => null) as {
            success?: boolean;
            data?: { url?: string };
        } | null;
        if (!upstreamResponse.ok || !upstreamData?.success || !upstreamData.data?.url) {
            return NextResponse.json({ success: false, message: 'Fotoğraf ImgBB’ye yüklenemedi' }, { status: 502 });
        }

        let avatarUrl: URL;
        try {
            avatarUrl = new URL(upstreamData.data.url);
        } catch {
            return NextResponse.json({ success: false, message: 'Görsel servisi geçersiz bir adres döndürdü' }, { status: 502 });
        }
        if (avatarUrl.protocol !== 'https:' || avatarUrl.hostname !== 'i.ibb.co' || avatarUrl.toString().length > 2048) {
            return NextResponse.json({ success: false, message: 'Görsel servisi geçersiz bir adres döndürdü' }, { status: 502 });
        }

        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE users SET avatar_url = ? WHERE id = ? AND session_version = ? AND is_active = TRUE',
            [avatarUrl.toString(), session.payload.userId, session.payload.sessionVersion]
        );
        if (result.affectedRows !== 1) {
            return NextResponse.json({ success: false, message: 'Oturum yenilendi; tekrar giriş yapın' }, { status: 409 });
        }

        return NextResponse.json({ success: true, message: 'Profil fotoğrafı güncellendi', data: { avatarUrl: avatarUrl.toString() } }, {
            headers: { 'Cache-Control': 'no-store, max-age=0' },
        });
    } catch (error) {
        console.error('Profil fotoğrafı yüklenirken hata:', error instanceof Error ? error.name : 'UnknownError');
        return NextResponse.json({ success: false, message: 'Profil fotoğrafı yüklenemedi' }, { status: 500 });
    }
}
