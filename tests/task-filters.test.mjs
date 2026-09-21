import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultTaskFilters, filterTasks, hasActiveTaskFilters } from '../lib/task-filters.ts';
import { createMonthGrid, taskDateKey, toLocalDateKey } from '../lib/task-calendar.ts';

const tasks = [
    {
        id: 1, assigned_to: 10, title: 'İçerik planı', description: 'Haftalık yayın', team_name: 'Pazarlama',
        status: 'pending', priority: 'high', due_date: '2026-10-10', created_at: '2026-09-01',
        project_id: 7, labels: [{ id: 3 }, { id: 5 }],
    },
    {
        id: 2, assigned_to: 20, title: 'Rapor', description: null, team_name: 'Ürün',
        status: 'completed', priority: 'low', due_date: null, created_at: '2026-09-12',
    },
    {
        id: 3, assigned_to: 10, title: 'Tasarım', description: 'Yeni ekran', team_name: 'Ürün',
        status: 'pending', priority: 'medium', due_date: '2026-09-20', created_at: '2026-09-08',
        project_id: 8, labels: [{ id: 5 }],
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

test('proje ve etiket filtreleri birlikte çalışır', () => {
    const result = filterTasks(tasks, { ...defaultTaskFilters, projectId: '7', labelId: '5' });
    assert.deepEqual(result.map((task) => task.id), [1]);
    assert.equal(hasActiveTaskFilters({ ...defaultTaskFilters, projectId: '7' }), true);
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

test('takvim haftayı pazartesi başlatır ve altı haftalık görünüm üretir', () => {
    const grid = createMonthGrid(new Date(2026, 8, 1), new Date(2026, 8, 21));

    assert.equal(grid.length, 42);
    assert.equal(toLocalDateKey(grid[0].date), '2026-08-31');
    assert.equal(grid.find((day) => day.isToday)?.key, '2026-09-21');
    assert.equal(grid.filter((day) => day.isCurrentMonth).length, 30);
});

test('görev tarihi saat diliminden etkilenmeden gün anahtarına çevrilir', () => {
    assert.equal(taskDateKey('2026-09-21'), '2026-09-21');
    assert.equal(taskDateKey('2026-09-21T00:00:00.000Z'), '2026-09-21');
    assert.equal(taskDateKey(null), null);
});
