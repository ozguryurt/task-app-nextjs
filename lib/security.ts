import { NextRequest, NextResponse } from 'next/server';
export {
    escapeHtml,
    hashOneTimeCode,
    hashToken,
    normalizeEmail,
    verifyOneTimeCode,
} from '@/lib/security-core';

const MAX_API_BODY_BYTES = 32 * 1024;

export function rejectOversizedRequest(request: NextRequest): NextResponse | null {
    const contentLength = Number(request.headers.get('content-length'));

    if (Number.isFinite(contentLength) && contentLength > MAX_API_BODY_BYTES) {
        return NextResponse.json(
            { success: false, message: 'İstek gövdesi çok büyük' },
            { status: 413 }
        );
    }

    return null;
}

export function isValidId(value: string): boolean {
    return /^[1-9]\d*$/.test(value);
}
