import assert from 'node:assert/strict';
import test from 'node:test';
import { generateVerificationCode, getCodeExpiry } from '../lib/auth-helpers.ts';
import { escapeHtml, hashOneTimeCode, hashToken, verifyOneTimeCode } from '../lib/security-core.ts';
import { createTaskSchema, updateTaskSchema } from '../lib/validations/task-schema.ts';

test('ham güvenlik tokenı yerine sabit uzunlukta özet üretilir', () => {
    const token = 'secret-reset-token';
    const digest = hashToken(token);

    assert.equal(digest.length, 64);
    assert.notEqual(digest, token);
    assert.equal(digest, hashToken(token));
});

test('tek kullanımlık kod 6 hanelidir ve HMAC ile amaca bağlı doğrulanır', () => {
    process.env.OTP_SECRET = 'test-only-secret-with-at-least-32-characters';
    const code = generateVerificationCode();
    const digest = hashOneTimeCode('USER@example.com', 'email-verification', code);

    assert.match(code, /^\d{6}$/);
    assert.equal(verifyOneTimeCode(digest, 'user@example.com', 'email-verification', code), true);
    assert.equal(verifyOneTimeCode(digest, 'user@example.com', 'password-reset', code), false);
    assert.equal(verifyOneTimeCode(digest, 'other@example.com', 'email-verification', code), false);
});

test('tek kullanımlık kodun geçerlilik süresi 5 dakikadır', () => {
    const before = Date.now();
    const expiry = getCodeExpiry();
    const after = Date.now();

    assert.ok(expiry.getTime() >= before + 5 * 60 * 1000);
    assert.ok(expiry.getTime() <= after + 5 * 60 * 1000);
});

test('e-posta HTML alanlarındaki kullanıcı verisi kaçışlanır', () => {
    assert.equal(
        escapeHtml('<img src=x onerror="alert(1)">'),
        '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
    );
});

test('görev oluşturma yalnızca izin verilen enum ve alanları kabul eder', () => {
    const invalidStatus = createTaskSchema.safeParse({
        assigned_to: 1,
        title: 'Görev',
        status: 'admin',
    });
    const unknownField = updateTaskSchema.safeParse({ status: 'completed', team_id: 99 });

    assert.equal(invalidStatus.success, false);
    assert.equal(unknownField.success, false);
});
