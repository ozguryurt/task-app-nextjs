import assert from 'node:assert/strict';
import test from 'node:test';
import { auditValue, findMentionedMembers } from '../lib/task-collaboration.ts';

const members = [
    { user_id: 1, name: 'Ayşe Yılmaz' },
    { user_id: 2, name: 'Can Demir' },
];

test('@bahsetme Türkçe ad ve kelime sınırlarıyla eşleşir', () => {
    assert.deepEqual(findMentionedMembers('Lütfen @Ayşe Yılmaz, kontrol eder misin? @Can Demir de görsün.', members), [1, 2]);
    assert.deepEqual(findMentionedMembers('x@Ayşe Yılmaz ve @Can Demirli', members), []);
    assert.deepEqual(findMentionedMembers('@AYŞE YILMAZ bakabilir misin?', members), [1]);
    assert.deepEqual(findMentionedMembers('@Can Demir kontrol et', [{ user_id: 3, name: 'Can' }, ...members]), [2]);
});

test('değişiklik geçmişi boş ve tarih değerlerini kararlı saklar', () => {
    assert.equal(auditValue(null), null);
    assert.equal(auditValue(''), null);
    assert.equal(auditValue(12), '12');
    assert.equal(auditValue(new Date(2026, 8, 26)), '2026-09-26');
});
