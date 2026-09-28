import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import type { TaskLabel } from '@/lib/store/team-store';

interface LabelAssignmentRow extends RowDataPacket, TaskLabel {
    task_id: number;
}

interface AssigneeRow extends RowDataPacket {
    task_id: number;
    user_id: number;
    name: string;
    email: string;
}

export async function attachTaskLabels<T extends { id: number; team_id: number; project_id: number | null; milestone_id?: number | null }>(tasks: T[]): Promise<Array<T & { labels: TaskLabel[]; milestone_name: string | null; assignees: Array<{ user_id: number; name: string; email: string }> }>> {
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
    const [assigneeRows] = await pool.query<AssigneeRow[]>(
        `SELECT ta.task_id, u.id AS user_id, u.name, u.email
         FROM task_assignees ta JOIN users u ON u.id = ta.user_id
         WHERE ta.task_id IN (${placeholders}) ORDER BY ta.task_id, ta.user_id`,
        tasks.map((task) => task.id)
    );
    const assigneesByTask = new Map<number, Array<{ user_id: number; name: string; email: string }>>();
    for (const row of assigneeRows) {
        const current = assigneesByTask.get(row.task_id) ?? [];
        current.push({ user_id: row.user_id, name: row.name, email: row.email });
        assigneesByTask.set(row.task_id, current);
    }
    const milestoneIds = [...new Set(tasks.map((task) => task.milestone_id).filter((id): id is number => typeof id === 'number'))];
    const milestoneNames = new Map<number, { name: string; teamId: number; projectId: number }>();
    if (milestoneIds.length > 0) {
        const [milestones] = await pool.query<RowDataPacket[]>(
            `SELECT id, name, team_id, project_id FROM project_milestones WHERE id IN (${milestoneIds.map(() => '?').join(',')})`,
            milestoneIds
        );
        for (const milestone of milestones) milestoneNames.set(Number(milestone.id), { name: String(milestone.name), teamId: Number(milestone.team_id), projectId: Number(milestone.project_id) });
    }
    return tasks.map((task) => ({
        ...task,
        labels: labelsByTask.get(task.id) ?? [],
        assignees: assigneesByTask.get(task.id) ?? [],
        milestone_name: task.milestone_id && milestoneNames.get(task.milestone_id)?.teamId === task.team_id && milestoneNames.get(task.milestone_id)?.projectId === task.project_id
            ? milestoneNames.get(task.milestone_id)?.name ?? null : null,
    }));
}
