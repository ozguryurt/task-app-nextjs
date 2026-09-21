import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import type { TaskLabel } from '@/lib/store/team-store';

interface LabelAssignmentRow extends RowDataPacket, TaskLabel {
    task_id: number;
}

export async function attachTaskLabels<T extends { id: number }>(tasks: T[]): Promise<Array<T & { labels: TaskLabel[] }>> {
    if (tasks.length === 0) return [];
    const placeholders = tasks.map(() => '?').join(',');
    const [rows] = await pool.query<LabelAssignmentRow[]>(
        `SELECT tla.task_id, tl.id, tl.team_id, tl.name, tl.color
         FROM task_label_assignments tla
         INNER JOIN task_labels tl ON tl.id = tla.label_id
         WHERE tla.task_id IN (${placeholders})
         ORDER BY tl.name ASC`,
        tasks.map((task) => task.id)
    );
    const labelsByTask = new Map<number, TaskLabel[]>();
    for (const row of rows) {
        labelsByTask.set(row.task_id, [...(labelsByTask.get(row.task_id) ?? []), {
            id: row.id,
            team_id: row.team_id,
            name: row.name,
            color: row.color,
        }]);
    }
    return tasks.map((task) => ({ ...task, labels: labelsByTask.get(task.id) ?? [] }));
}
