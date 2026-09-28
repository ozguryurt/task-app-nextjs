import assert from 'node:assert/strict';
import test from 'node:test';
import { createTaskSchema, updateTaskSchema } from '../lib/validations/task-schema.ts';

test('bir veya birden fazla takım üyesi seçilebilir', () => {
    assert.equal(createTaskSchema.safeParse({ title: 'Tek kişi', assignee_ids: [1] }).success, true);
    assert.equal(createTaskSchema.safeParse({ title: 'Ortak görev', assignee_ids: [1, 2] }).success, true);
    assert.equal(updateTaskSchema.safeParse({ assignee_ids: [2, 3] }).success, true);
});

test('boş, tekrar eden veya geçersiz atama reddedilir', () => {
    for (const assignee_ids of [[], [1, 1], [0], [-1], ['2']]) {
        assert.equal(createTaskSchema.safeParse({ title: 'Görev', assignee_ids }).success, false);
    }
});
