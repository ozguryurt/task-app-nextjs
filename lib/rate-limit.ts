import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

interface RateLimitOptions {
    scope: string;
    limit: number;
    windowMs: number;
    identifier?: string;
}

const globalRateLimit = globalThis as typeof globalThis & {
    __taskflowRateLimits?: Map<string, RateLimitEntry>;
};

const buckets = globalRateLimit.__taskflowRateLimits ?? new Map<string, RateLimitEntry>();
globalRateLimit.__taskflowRateLimits = buckets;
const MAX_BUCKETS = 10_000;

function clientIdentifier(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    return forwardedFor || request.headers.get('x-real-ip') || 'unknown';
}

export function enforceRateLimit(
    request: NextRequest,
    { scope, limit, windowMs, identifier }: RateLimitOptions
): NextResponse | null {
    const now = Date.now();
    const key = `${scope}:${clientIdentifier(request)}:${identifier ?? ''}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
        if (buckets.size >= MAX_BUCKETS) {
            for (const [bucketKey, entry] of buckets) {
                if (entry.resetAt <= now) buckets.delete(bucketKey);
            }

            while (buckets.size >= MAX_BUCKETS) {
                const oldestKey = buckets.keys().next().value as string | undefined;
                if (!oldestKey) break;
                buckets.delete(oldestKey);
            }
        }

        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return null;
    }

    current.count += 1;
    if (current.count <= limit) return null;

    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
        { success: false, message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.' },
        {
            status: 429,
            headers: {
                'Retry-After': String(retryAfter),
                'Cache-Control': 'no-store',
            },
        }
    );
}
