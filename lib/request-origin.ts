interface OriginCheckInput {
    origin: string;
    internalOrigin: string;
    host?: string | null;
    forwardedHost?: string | null;
    forwardedProto?: string | null;
    configuredOrigins?: string | null;
}

function firstHeaderValue(value?: string | null): string {
    return value?.split(',')[0]?.trim() ?? '';
}

function normalizeHttpOrigin(value: string): string | null {
    try {
        const url = new URL(value);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
        return url.origin;
    } catch {
        return null;
    }
}

export function getAllowedRequestOrigins({
    internalOrigin,
    host,
    forwardedHost,
    forwardedProto,
    configuredOrigins,
}: Omit<OriginCheckInput, 'origin'>): Set<string> {
    const configuredValues = (configuredOrigins ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    const configured = configuredValues
        .map((value) => normalizeHttpOrigin(value))
        .filter((value): value is string => Boolean(value));

    // Yapılandırılmış origin varsa tek güven kaynağı odur. Böylece istemcinin
    // taklit edebileceği Host/X-Forwarded-Host başlıkları allowlist'i genişletemez.
    if (configuredValues.length > 0) return new Set(configured);

    const allowed = new Set<string>();
    const normalizedInternalOrigin = normalizeHttpOrigin(internalOrigin);
    if (normalizedInternalOrigin) allowed.add(normalizedInternalOrigin);

    const publicHost = firstHeaderValue(forwardedHost) || firstHeaderValue(host);
    const internalProtocol = normalizeHttpOrigin(internalOrigin)
        ? new URL(internalOrigin).protocol.replace(':', '')
        : 'https';
    const publicProtocol = firstHeaderValue(forwardedProto) || internalProtocol;

    if (publicHost && (publicProtocol === 'http' || publicProtocol === 'https')) {
        const proxyOrigin = normalizeHttpOrigin(`${publicProtocol}://${publicHost}`);
        if (proxyOrigin) allowed.add(proxyOrigin);
    }

    return allowed;
}

export function isRequestOriginAllowed(input: OriginCheckInput): boolean {
    const normalizedOrigin = normalizeHttpOrigin(input.origin);
    if (!normalizedOrigin) return false;

    return getAllowedRequestOrigins(input).has(normalizedOrigin);
}
