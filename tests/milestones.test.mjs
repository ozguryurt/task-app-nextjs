import assert from 'node:assert/strict';
import test from 'node:test';
import { createTaskSchema, updateTaskSchema } from '../lib/validations/task-schema.ts';

test('a task may select or clear a project milestone', () => {
    const created = createTaskSchema.safeParse({ assignee_ids: [1], title: 'Launch', project_id: 2, milestone_id: 3 });
    const cleared = updateTaskSchema.safeParse({ milestone_id: null });
    assert.equal(created.success, true);
    assert.equal(cleared.success, true);
});

test('invalid milestone identifiers are rejected', () => {
    assert.equal(updateTaskSchema.safeParse({ milestone_id: 0 }).success, false);
    assert.equal(updateTaskSchema.safeParse({ milestone_id: -1 }).success, false);
    assert.equal(updateTaskSchema.safeParse({ milestone_id: '3' }).success, false);
});
