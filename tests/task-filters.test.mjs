import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultTaskFilters, filterTasks, hasActiveTaskFilters } from '../lib/task-filters.ts';

const tasks = [
    {
        id: 1, assigned_to: 10, title: 'İçerik planı', description: 'Haftalık yayın', team_name: 'Pazarlama',
        status: 'pending', priority: 'high', due_date: '2026-10-10', created_at: '2026-09-01',
    },
    {
        id: 2, assigned_to: 20, title: 'Rapor', description: null, team_name: 'Ürün',
        status: 'completed', priority: 'low', due_date: null, created_at: '2026-09-12',
    },
    {
        id: 3, assigned_to: 10, title: 'Tasarım', description: 'Yeni ekran', team_name: 'Ürün',
        status: 'pending', priority: 'medium', due_date: '2026-09-20', created_at: '2026-09-08',
    },
];

test('Türkçe arama ek alanlarda da çalışır', () => {
    const result = filterTasks(tasks, { ...defaultTaskFilters, query: 'PAZARLAMA' }, (task) => task.team_name);
    assert.deepEqual(result.map((task) => task.id), [1]);
});

test('durum ve öncelik birlikte filtrelenir', () => {
    const result = filterTasks(tasks, { ...defaultTaskFilters, status: 'pending', priority: 'medium' });
    assert.deepEqual(result.map((task) => task.id), [3]);
});

test('atanan kişi filtresi diğer filtrelerle birlikte çalışır', () => {
    const result = filterTasks(tasks, { ...defaultTaskFilters, assignedTo: '10', status: 'pending' });
    assert.deepEqual(result.map((task) => task.id), [3, 1]);
});

test('yakın teslim sıralamasında tarihsiz görev sona kalır', () => {
    const result = filterTasks(tasks, { ...defaultTaskFilters, sort: 'due_soon' });
    assert.deepEqual(result.map((task) => task.id), [3, 1, 2]);
});

test('öncelik sıralaması girdiyi değiştirmez ve sıfırlama durumu doğru hesaplanır', () => {
    const originalOrder = tasks.map((task) => task.id);
    const result = filterTasks(tasks, { ...defaultTaskFilters, sort: 'priority' });
    assert.deepEqual(result.map((task) => task.id), [1, 3, 2]);
    assert.deepEqual(tasks.map((task) => task.id), originalOrder);
    assert.equal(hasActiveTaskFilters(defaultTaskFilters), false);
    assert.equal(hasActiveTaskFilters({ ...defaultTaskFilters, query: ' görev ' }), true);
});
