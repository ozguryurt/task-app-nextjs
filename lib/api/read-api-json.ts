/** Parse an API response without displaying an HTML error page as a JSON syntax error. */
export async function readApiJson(response: Response): ReturnType<Response['json']> {
    const contentType = response.headers.get('content-type') ?? '';
    const pathname = response.url ? new URL(response.url).pathname : 'API';

    if (!/\bapplication\/(?:[\w.-]+\+)?json\b/i.test(contentType)) {
        throw new Error(`${pathname} isteği beklenmeyen bir yanıt döndürdü (${response.status}). Lütfen sunucu yapılandırmasını kontrol edin.`);
    }

    try {
        return await response.json();
    } catch {
        throw new Error(`${pathname} isteğinden geçerli bir JSON yanıtı alınamadı (${response.status}).`);
    }
}
