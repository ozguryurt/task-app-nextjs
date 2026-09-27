import assert from 'node:assert/strict';
import test from 'node:test';
import { readApiJson } from '../lib/api/read-api-json.ts';

test('JSON API errors remain available to callers', async () => {
    const response = new Response(JSON.stringify({ error: 'Oturum bulunamadı' }), {
        status: 401,
        headers: { 'content-type': 'application/json; charset=utf-8' },
    });
    assert.deepEqual(await readApiJson(response), { error: 'Oturum bulunamadı' });
});

test('HTML 404 responses produce a useful error instead of a JSON syntax error', async () => {
    const response = new Response('<!DOCTYPE html><html></html>', {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
    });
    await assert.rejects(readApiJson(response), /beklenmeyen bir yanıt.*404/);
});

test('malformed JSON responses produce a controlled error', async () => {
    const response = new Response('{invalid', {
        status: 500,
        headers: { 'content-type': 'application/json' },
    });
    await assert.rejects(readApiJson(response), /geçerli bir JSON yanıtı alınamadı.*500/);
});
